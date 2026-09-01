import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook providing authentication state and role-based helpers.
 */
export function useAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  const isLoading = authLoading || (isAuthenticated && user === undefined);

  return {
    user,
    isAuthenticated,
    isLoading,
    isCustomer: user?.role === "customer",
    isSeller: user?.role === "seller",
    isAdmin: user?.role === "admin",
  };
}
