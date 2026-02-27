import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, LogOut, Loader2, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { db } from "@/lib/supabase-helpers";
import ReportCard from "@/components/ReportCard";
import MapView from "@/components/MapView";
import { toast } from "sonner";
import type { Official } from "@/lib/supabase-helpers";

export default function Dashboard() {
  const { user, official, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { reports, loading: reportsLoading, refetch } = useReports();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (official?.role === "police") {
      db.officials()
        .select("*")
        .then(({ data }: any) => {
          if (data) setOfficials(data as Official[]);
        });
    }
  }, [official]);

  const handleAccept = async (reportId: string) => {
    if (!official) return;
    setAccepting(reportId);

    const { error } = await db.reports()
      .update({ status: "taken", assigned_driver_id: official.id })
      .eq("id", reportId)
      .eq("status", "pending");

    setAccepting(null);
    if (error) {
      toast.error("Failed to accept report");
    } else {
      toast.success("Report accepted! Respond immediately.");
      refetch();
    }
  };

  const handleResolve = async (reportId: string) => {
    const { error } = await db.reports()
      .update({ status: "resolved" })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to resolve report");
    } else {
      toast.success("Report marked as resolved");
      refetch();
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!official) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Your account is not registered as an official.</p>
          <Button onClick={() => { signOut(); navigate("/login"); }}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const isAmbulance = official.role === "ambulance";
  const isPolice = official.role === "police";
  const filteredReports = isAmbulance
    ? reports.filter((r) => r.status === "pending" || r.assigned_driver_id === official.id)
    : reports;

  const getAssignedName = (driverId: string | null) => {
    if (!driverId) return undefined;
    const found = officials.find((o) => o.id === driverId);
    return found?.name;
  };

  const mapMarkers = filteredReports.map((r) => ({
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    label: r.description || "Accident Report",
    id: r.id,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight block leading-none">RapidRescue</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {isAmbulance ? <Truck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                {official.name} — {official.role}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending" value={reports.filter((r) => r.status === "pending").length} variant="danger" />
          <StatCard label="In Progress" value={reports.filter((r) => r.status === "taken").length} variant="warning" />
          <StatCard label="Resolved" value={reports.filter((r) => r.status === "resolved").length} variant="success" />
        </div>

        {mapMarkers.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <MapView markers={mapMarkers} className="h-56" />
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold mb-3">
            {isAmbulance ? "Available Reports" : "All Reports"}
          </h2>
          {reportsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reports at this time.</div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showActions={isAmbulance ? "ambulance" : isPolice ? "police" : null}
                  onAccept={() => handleAccept(report.id)}
                  onResolve={() => handleResolve(report.id)}
                  accepting={accepting === report.id}
                  assignedName={isPolice ? getAssignedName(report.assigned_driver_id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, variant }: { label: string; value: number; variant: "danger" | "warning" | "success" }) {
  const colors = { danger: "text-primary", warning: "text-warning", success: "text-success" };
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <p className={`text-2xl font-black ${colors[variant]}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
