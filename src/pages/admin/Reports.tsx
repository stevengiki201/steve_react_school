import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminReports() {
  const users = useQuery(api.users.getAllUsers);
  const sellers = useQuery(api.users.getAllSellers);
  const products = useQuery(api.products.listProducts, { limit: 100 });
  const orders = useQuery(api.orders.getAllOrders, { limit: 100 });

  const totalRevenue =
    orders?.reduce((sum, o) => sum + (o.status === "delivered" ? o.total : 0), 0) ?? 0;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Reports</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {sellers?.length ?? 0} sellers, {(users?.length ?? 0) - (sellers?.length ?? 0)} customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {products?.filter((p) => p.isActive).length ?? 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {orders?.filter((o) => o.status === "delivered").length ?? 0} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">TSh {totalRevenue.toLocaleString("en-TZ")}</p>
            <p className="text-xs text-muted-foreground mt-1">From delivered orders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
