import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle, Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed");
    } else {
      toast.success("Logged in successfully");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Reporting
          </Link>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <AlertTriangle className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Officials Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ambulance & Police personnel only
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@example.com"
              className="h-12 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 text-base"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold" size="lg">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Contact your administrator for credentials
        </p>
      </div>
    </div>
  );
}
