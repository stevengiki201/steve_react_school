import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function AdminOrders() {
  const orders = useQuery(api.orders.getAllOrders, { limit: 50 });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Orders</h1>

      {orders === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="No orders yet"
          description="Orders will appear here when customers make purchases."
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <span>Order #</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center"
            >
              <span className="text-sm font-medium">#{order.orderNumber}</span>
              <span className="text-sm text-muted-foreground">{order.customerName}</span>
              <PriceDisplay amount={order.total} size="sm" />
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-TZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
