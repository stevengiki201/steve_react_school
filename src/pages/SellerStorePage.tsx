import { useParams, Link } from "react-router-dom";
import { Shield, MapPin, Store, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROUTES } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerStorePage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const seller = useQuery(
    api.users.getSellerProfileById,
    sellerId ? { sellerId: sellerId as any } : "skip",
  );
  const products = useQuery(
    api.products.getProductsBySeller,
    sellerId ? { sellerId: sellerId as any, includeInactive: false } : "skip",
  );

  if (seller === undefined) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          title="Store not found"
          description="This seller doesn't exist or has been removed."
          action={
            <Button asChild>
              <Link to="/explore">Browse Market</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Store header */}
      <div className="rounded-lg border bg-card p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
            {seller.logo ? (
              <img
                src={seller.logo}
                alt={seller.businessName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Store className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground">
                {seller.businessName}
              </h1>
              {seller.isVerified && (
                <Badge variant="success" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            {seller.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {seller.location}
              </p>
            )}
            {seller.businessDescription && (
              <p className="text-sm text-muted-foreground mt-2">
                {seller.businessDescription}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {seller.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {seller.rating.toFixed(1)}
                </span>
              )}
              <span>{seller.totalSales} sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="font-semibold text-foreground mb-3">
        Products ({products?.length ?? 0})
      </h2>

      {products === undefined ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="This seller hasn't listed any products yet."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product.slug}`}
              className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-muted">
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Store className="h-8 w-8" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                <PriceDisplay amount={product.price} size="sm" className="mt-1 block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
