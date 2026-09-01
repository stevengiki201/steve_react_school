import { TrendingUp, ShoppingBag, Eye, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerAnalytics() {
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const products = useQuery(
    api.products.getProductsBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, includeInactive: false } : "skip",
  );
  const orders = useQuery(
    api.orders.getOrdersBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, limit: 100 } : "skip",
  );
  const campaigns = useQuery(
    api.advertisements.getSellerCampaigns,
    sellerProfile ? { sellerId: sellerProfile._id } : "skip",
  );

  const totalRevenue =
    orders?.reduce((sum, o) => sum + (o && o.status === "delivered" ? o.total : 0), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const deliveredOrders =
    orders?.filter((o) => o && o.status === "delivered").length ?? 0;
  const totalCampaigns = campaigns?.length ?? 0;
  const totalAdSpend =
    campaigns?.reduce((sum, c) => sum + c.spent, 0) ?? 0;

  // Top products by sales
  const topProducts = products
    ? [...products]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5)
    : [];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <PriceDisplay amount={totalRevenue} className="text-xl font-bold mt-1 block" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">{deliveredOrders} delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Products</span>
            </div>
            <p className="text-2xl font-bold mt-1">{products?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ad Spend</span>
            </div>
            <PriceDisplay amount={totalAdSpend} className="text-xl font-bold mt-1 block" />
            <p className="text-xs text-muted-foreground">{totalCampaigns} campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stockQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.totalSales} sold</p>
                    <PriceDisplay amount={product.price * product.totalSales} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign performance */}
      {campaigns && campaigns.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Budget: <PriceDisplay amount={campaign.budget} size="sm" /></span>
                    <span>Spent: <PriceDisplay amount={campaign.spent} size="sm" /></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
