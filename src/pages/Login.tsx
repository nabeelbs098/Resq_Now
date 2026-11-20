
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  Shield,
  Loader2,
  ArrowLeft,
  Mail,
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type LoginMode = "login" | "forgot" | "update";

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Detect when the user opens a Supabase password recovery link.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Normal login
  const handleLogin = async (e: FormEvent) => {
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

  // Send password recovery email
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password recovery email sent. Check your inbox.");
    }
  };

  // Save the new password
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reporting
          </Link>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <AlertTriangle className="h-7 w-7 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            {mode === "login"
              ? "Officials Login"
              : mode === "forgot"
              ? "Forgot Password?"
              : "Set New Password"}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Ambulance & Police personnel only"
              : mode === "forgot"
              ? "Enter your registered email to receive a reset link"
              : "Choose a new password for your account"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form
            onSubmit={handleLogin}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
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
                placeholder="Enter password"
                className="h-12 text-base"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Shield className="mr-2 h-5 w-5" />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <form
            onSubmit={handleForgotPassword}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@example.com"
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Mail className="mr-2 h-5 w-5" />
              )}
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* UPDATE PASSWORD FORM */}
        {mode === "update" && (
          <form
            onSubmit={handleUpdatePassword}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-5 w-5" />
              )}
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Contact your administrator for credentials
        </p>
      </div>
    </div>
  );
}
