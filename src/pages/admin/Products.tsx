import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PriceDisplay } from "@/components/ui/price-display";

export default function AdminProducts() {
  const products = useQuery(api.products.listProducts, { limit: 100 });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Products</h1>

      {products === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products yet"
          description="Products will appear here once sellers list them."
        />
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="p-4 rounded-lg border bg-card flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground">
                  <PriceDisplay amount={product.price} size="sm" /> | Stock:{" "}
                  {product.stockQuantity} | Sales: {product.totalSales}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={product.isActive ? "success" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
                {product.isFeatured && <Badge variant="default">Featured</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
