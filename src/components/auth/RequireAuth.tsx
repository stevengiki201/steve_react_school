import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function RequireAuth({
  children,
  allowedRoles,
}: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${ROUTES.auth}?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <>{children}</>;
}
