import { Store, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminSellers() {
  const sellers = useQuery(api.users.getAllSellers);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Sellers</h1>

      {sellers === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={<Store className="h-12 w-12" />}
          title="No sellers yet"
          description="Sellers will appear here once they register."
        />
      ) : (
        <div className="space-y-3">
          {sellers.map((seller) => (
            <div
              key={seller._id}
              className="p-4 rounded-lg border bg-card flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                {seller.logo ? (
                  <img
                    src={seller.logo}
                    alt={seller.businessName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{seller.businessName}</span>
                  {seller.isVerified && (
                    <Shield className="h-4 w-4 text-green-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {seller.location} | Sales: {seller.totalSales} | Orders: {seller.totalOrders}
                </p>
              </div>
              <Badge variant={seller.isActive ? "success" : "secondary"}>
                {seller.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
