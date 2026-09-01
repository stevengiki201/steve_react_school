import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, MARKETHUB } from "@/lib/constants";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || ROUTES.home;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signIn("password", { email, password, redirectTo: returnTo });
    } catch (err: any) {
      setError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email,
        password,
        redirectTo: returnTo,
        flow: "signUp",
      } as any);
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {MARKETHUB.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to browse, buy, and sell
          </p>
        </div>

        {/* Email + Password */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignUp}
              disabled={isSubmitting}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-muted/30 px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>

        {/* OAuth */}
        <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { redirectTo: returnTo })}
          >
            Continue with GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { redirectTo: returnTo })}
          >
            Continue with Google
          </Button>
        </div>

        {/* Quick test accounts */}
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <p className="text-xs font-medium text-foreground mb-2">🧪 Quick Test Accounts</p>
          <p className="text-[11px] text-muted-foreground">
            Sign up with any email above. Then use the <strong>Seed Data</strong> button on the
            Admin Dashboard (<code>/admin</code>) to populate demo products.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
