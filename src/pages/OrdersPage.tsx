import { Link, useParams } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROUTES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";
import { OrderTimeline } from "@/components/ui/order-timeline";

export default function OrdersPage() {
  const { orderId } = useParams();
  const orders = useQuery(api.orders.getMyOrders, {});

  if (orders === undefined) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 py-6">
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No orders yet"
          description="Your order history will appear here after your first purchase."
          action={
            <Button asChild>
              <Link to="/explore">Start Shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // If viewing a specific order
  if (orderId) {
    const order = orders.find((o) => o._id === orderId);
    if (!order) {
      return (
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Button asChild className="mt-4">
            <Link to={ROUTES.orders}>View All Orders</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="px-4 py-6">
        <Link
          to={ROUTES.orders}
          className="text-xs text-muted-foreground hover:text-foreground mb-3 block"
        >
          ← My Orders
        </Link>
        <h1 className="text-lg font-bold text-foreground mb-1">
          Order #{order.orderNumber}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {new Date(order.createdAt).toLocaleDateString("en-TZ", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="p-4 rounded-lg border bg-card mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Status</span>
            <Badge className={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <OrderTimeline currentStatus={order.status} />
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <PriceDisplay amount={order.total} />
          </div>
        </div>
      </div>
    );
  }

  // Order list
  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-bold text-foreground mb-4">My Orders</h1>

      <div className="space-y-2">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Order #{order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-TZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={ORDER_STATUS_COLORS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <PriceDisplay amount={order.total} size="sm" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
