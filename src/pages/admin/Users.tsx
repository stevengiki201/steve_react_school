import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROLE_LABELS } from "@/lib/constants";

export default function AdminUsers() {
  const users = useQuery(api.users.getAllUsers);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>

      {users === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No users yet"
          description="Users will appear here once they sign up."
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                  {user.name?.[0] || "?"}
                </div>
                <span className="text-sm font-medium truncate">{user.name}</span>
              </div>
              <span className="text-sm text-muted-foreground truncate">{user.email}</span>
              <Badge variant="secondary">
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
              <Badge variant={user.isActive ? "success" : "destructive"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
