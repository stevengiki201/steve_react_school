import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  Megaphone,
  ArrowRight,
  DollarSign,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function AdminDashboard() {
  const [seedStatus, setSeedStatus] = useState("");
  const seedAll = useMutation(api.seed.seedAll);

  const users = useQuery(api.users.getAllUsers);
  const sellers = useQuery(api.users.getAllSellers);
  const allProducts = useQuery(api.products.listProducts, { limit: 100 });
  const orders = useQuery(api.orders.getAllOrders, { limit: 100 });

  const handleSeed = async () => {
    setSeedStatus("Seeding...");
    try {
      const result = await seedAll();
      setSeedStatus(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setSeedStatus(`Error: ${err.message}`);
    }
  };

  const totalRevenue =
    orders?.reduce((sum, o) => sum + (o.status === "delivered" ? o.total : 0), 0) ?? 0;

  const stats = [
    { label: "Users", value: users?.length ?? 0, icon: Users },
    { label: "Sellers", value: sellers?.length ?? 0, icon: Store },
    { label: "Products", value: allProducts?.length ?? 0, icon: Package },
    { label: "Orders", value: orders?.length ?? 0, icon: ShoppingBag },
  ];

  const quickLinks = [
    { label: "Manage Users", to: ROUTES.adminUsers, icon: Users },
    { label: "Manage Sellers", to: ROUTES.adminSellers, icon: Store },
    { label: "Manage Products", to: ROUTES.adminProducts, icon: Package },
    { label: "Manage Orders", to: ROUTES.adminOrders, icon: ShoppingBag },
    { label: "Manage Categories", to: ROUTES.adminCategories, icon: Megaphone },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">MarketHub Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <PriceDisplay amount={totalRevenue} className="text-xl font-bold" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Seed Demo Data</p>
                <p className="text-xs text-muted-foreground">
                  Add sample sellers, products, orders, and campaigns
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleSeed}>
              Seed Data
            </Button>
          </div>
          {seedStatus && (
            <pre className="mt-3 text-xs bg-muted rounded p-2 overflow-auto max-h-32">
              {seedStatus}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <link.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{link.label}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.adminOrders}>
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
            <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <PriceDisplay amount={order.total} size="sm" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
