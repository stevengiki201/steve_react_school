import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerOrders() {
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const orders = useQuery(
    api.orders.getOrdersBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, limit: 50 } : "skip",
  );
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Orders</h1>

      {orders === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="No orders yet"
          description="Orders will appear here when customers purchase your products."
        />
      ) : (
        <div className="space-y-3">
          {orders.filter(Boolean).map((order) => (
            <div key={order!._id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Order #{order!.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order!.customer?.name} | {order!.customer?.phone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order!.createdAt).toLocaleDateString("en-TZ", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <PriceDisplay amount={order!.total} size="sm" className="block" />
                  <Badge className={`${ORDER_STATUS_COLORS[order!.status]} mt-1`}>
                    {ORDER_STATUS_LABELS[order!.status]}
                  </Badge>
                </div>
              </div>

              {order!.items && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  {order!.items.map((item: any) => (
                    <span key={item._id}>
                      {item.productName} x{item.quantity}
                      {item !== order!.items![order!.items!.length - 1] && " | "}
                    </span>
                  ))}
                </div>
              )}

              {/* Status actions */}
              <div className="mt-3 pt-3 border-t flex gap-2 flex-wrap">
                {order!.status === "paid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus({ orderId: order!._id, status: "confirmed" })
                    }
                  >
                    Confirm Order
                  </Button>
                )}
                {order!.status === "confirmed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus({ orderId: order!._id, status: "processing" })
                    }
                  >
                    Start Processing
                  </Button>
                )}
                {order!.status === "processing" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus({ orderId: order!._id, status: "shipped" })
                    }
                  >
                    Mark Shipped
                  </Button>
                )}
                {order!.status === "shipped" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus({ orderId: order!._id, status: "delivered" })
                    }
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
