import { DollarSign } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminPayments() {
  const orders = useQuery(api.orders.getAllOrders, { limit: 100 });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Payments</h1>

      {orders === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-12 w-12" />}
          title="No payments yet"
          description="Payment records will appear here when orders are placed."
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <span>Order #</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Method</span>
          </div>
          {orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center"
            >
              <span className="text-sm font-medium">#{order.orderNumber}</span>
              <span className="text-sm text-muted-foreground">{order.customerName}</span>
              <span className="text-sm font-semibold text-primary">
                TSh {order.total.toLocaleString("en-TZ")}
              </span>
              <span className="text-xs text-muted-foreground">{order.paymentMethod}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
