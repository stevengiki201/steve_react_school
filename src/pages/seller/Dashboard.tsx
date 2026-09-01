import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Megaphone,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerDashboard() {
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const products = useQuery(
    api.products.getProductsBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, includeInactive: true } : "skip",
  );
  const orders = useQuery(
    api.orders.getOrdersBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, limit: 5 } : "skip",
  );
  const campaigns = useQuery(
    api.advertisements.getSellerCampaigns,
    sellerProfile ? { sellerId: sellerProfile._id } : "skip",
  );

  const totalProducts = products?.length ?? 0;
  const activeProducts = products?.filter((p) => p.isActive).length ?? 0;
  const totalRevenue =
    orders?.reduce((sum, o) => sum + (o && o.status === "delivered" ? o.total : 0), 0) ?? 0;
  const pendingOrders =
    orders?.filter(
      (o) => o && (o.status === "paid" || o.status === "confirmed"),
    ).length ?? 0;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, {sellerProfile?.businessName ?? "Seller"} 👋
          </h1>
        </div>
        <Button asChild>
          <Link to={ROUTES.sellerProductNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Products</span>
            </div>
            <p className="text-2xl font-bold mt-1">{activeProducts}</p>
            <p className="text-xs text-muted-foreground">{totalProducts} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pending Orders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{pendingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <PriceDisplay amount={totalRevenue} className="text-2xl mt-1 block" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Campaigns</span>
            </div>
            <p className="text-2xl font-bold mt-1">{campaigns?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Link
          to={ROUTES.sellerProducts}
          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
        >
          <Package className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold text-sm">Manage Products</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add, edit, or deactivate products
          </p>
        </Link>
        <Link
          to={ROUTES.sellerOrders}
          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
        >
          <ShoppingBag className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold text-sm">View Orders</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Process and fulfill orders
          </p>
        </Link>
        <Link
          to={ROUTES.sellerCampaigns}
          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
        >
          <Megaphone className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold text-sm">Advertising</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create campaigns and track results
          </p>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.sellerOrders}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No orders yet
            </p>
          ) : (
            <div className="space-y-2">
              {orders.filter(Boolean).map((order) => (
                <div
                  key={order!._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">#{order!.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order!.customer?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceDisplay amount={order!.total} size="sm" />
                    <span
                      className={`block text-[10px] px-2 py-0.5 rounded-full mt-1 ${ORDER_STATUS_COLORS[order!.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order!.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
