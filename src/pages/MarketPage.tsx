import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Shield, Store, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROUTES, formatPrice } from "@/lib/constants";

export default function MarketPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || undefined;

  const categories = useQuery(api.categories.listCategories);
  const products = useQuery(api.products.searchProducts, {
    query: searchQuery,
    categoryId: categoryId as any,
    limit: 40,
  });

  const activeCategory = categories?.find((c) => c._id === categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {activeCategory ? activeCategory.name : "Marketplace"}
        </h1>
        {searchQuery && (
          <p className="mt-1 text-sm text-muted-foreground">
            Results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const q = form.get("q") as string;
            setSearchParams((prev) => {
              if (q?.trim()) prev.set("q", q.trim());
              else prev.delete("q");
              return prev;
            });
          }}
          className="flex-1"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder="Search products..."
              defaultValue={searchQuery}
              className="pl-9"
            />
          </div>
        </form>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      {/* Category chips */}
      {categories && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          <Link to={ROUTES.market}>
            <Badge
              variant={!categoryId ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
            >
              All
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`${ROUTES.market}?${cat._id === categoryId ? "category=" + cat._id : "category=" + cat._id}${searchQuery ? "&q=" + searchQuery : ""}`}
            >
              <Badge
                variant={cat._id === categoryId ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Active filters */}
      {(searchQuery || activeCategory) && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span>Active:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              "{searchQuery}"
              <button
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete("q");
                    return prev;
                  });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeCategory && (
            <Badge variant="secondary" className="gap-1">
              {activeCategory.name}
              <button
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete("category");
                    return prev;
                  });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Product grid */}
      {products === undefined ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            searchQuery
              ? `No products match "${searchQuery}". Try a different search.`
              : "No products available yet. Check back soon!"
          }
          action={
            <Button variant="outline" asChild>
              <Link to={ROUTES.market}>Browse All</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => {
            const primaryImage =
              product.images?.find((i: any) => i.isPrimary) ??
              product.images?.[0];

            return (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Store className="h-8 w-8" />
                    </div>
                  )}
                  {product.isFeatured && (
                    <Badge className="absolute top-2 left-2 text-[10px]">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                  {product.seller && (
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      {product.seller.isVerified && (
                        <Shield className="h-3 w-3 text-green-600" />
                      )}
                      {product.seller.businessName}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
