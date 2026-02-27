import { Clock, MapPin, User, AlertTriangle, CheckCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/supabase-helpers";

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    className: "bg-primary/15 text-primary border-primary/30",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  taken: {
    label: "Accepted",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: <Truck className="h-3 w-3" />,
  },
  resolved: {
    label: "Resolved",
    className: "bg-success/15 text-success border-success/30",
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

type Props = {
  report: Report;
  onAccept?: () => void;
  onResolve?: () => void;
  accepting?: boolean;
  showActions?: "ambulance" | "police" | null;
  assignedName?: string;
};

export default function ReportCard({ report, onAccept, onResolve, accepting, showActions, assignedName }: Props) {
  const status = statusConfig[report.status] || statusConfig.pending;
  const time = new Date(report.created_at);
  const timeAgo = getTimeAgo(time);

  return (
    <div className="glass-card rounded-xl p-4 space-y-3 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <Badge variant="outline" className={`${status.className} gap-1 font-semibold`}>
          {status.icon}
          {status.label}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
      </div>

      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="Accident scene"
          className="w-full h-40 object-cover rounded-lg"
          loading="lazy"
        />
      )}

      {report.description && (
        <p className="text-sm leading-relaxed">{report.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <MapPin className="h-3 w-3" />
        {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
      </div>

      {assignedName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          Assigned to: <span className="font-semibold text-foreground">{assignedName}</span>
        </div>
      )}

      {showActions === "ambulance" && report.status === "pending" && onAccept && (
        <Button onClick={onAccept} disabled={accepting} className="w-full emergency-glow" size="lg">
          <Truck className="mr-2 h-4 w-4" />
          {accepting ? "Accepting..." : "Accept & Respond"}
        </Button>
      )}

      {showActions === "police" && report.status !== "resolved" && onResolve && (
        <Button onClick={onResolve} variant="outline" className="w-full" size="lg">
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Resolved
        </Button>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
