import { Link } from "react-router-dom";
import { Plus, Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES, formatPrice } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerProducts() {
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const products = useQuery(
    api.products.getProductsBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, includeInactive: true } : "skip",
  );
  const deactivateProduct = useMutation(api.products.deactivateProduct);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Products</h1>
        <Button asChild>
          <Link to={ROUTES.sellerProductNew}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Link>
        </Button>
      </div>

      {products === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Start by adding your first product to the marketplace."
          action={
            <Button asChild>
              <Link to={ROUTES.sellerProductNew}>Add Product</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <div className="h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <PriceDisplay amount={product.price} size="sm" className="mt-1" />
                <p className="text-xs text-muted-foreground">
                  Stock: {product.stockQuantity} | Sales: {product.totalSales}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/product/${product.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {product.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deactivateProduct({ productId: product._id })}
                  >
                    <EyeOff className="h-4 w-4" />
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
