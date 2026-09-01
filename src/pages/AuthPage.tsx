import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, MARKETHUB } from "@/lib/constants";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || ROUTES.market;

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

        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-3">
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

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
