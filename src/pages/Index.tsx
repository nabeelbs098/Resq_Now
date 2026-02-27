import { Link } from "react-router-dom";
import { AlertTriangle, Shield, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportForm from "@/components/ReportForm";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">RapidRescue</span>
          </div>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Shield className="h-4 w-4" />
              Officials Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container px-4 py-8 max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4 emergency-pulse">
            <AlertTriangle className="h-4 w-4" />
            Emergency Reporting
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Report an Accident
          </h1>
          <p className="text-muted-foreground">
            No login required. Your report helps save lives.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <ReportForm />
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link to="/login" className="group">
            <div className="glass-card rounded-xl p-4 text-center transition-all group-hover:shadow-md">
              <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold">Ambulance Portal</p>
              <ArrowRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
          <Link to="/login" className="group">
            <div className="glass-card rounded-xl p-4 text-center transition-all group-hover:shadow-md">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold">Police Portal</p>
              <ArrowRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
