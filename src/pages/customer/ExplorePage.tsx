import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/ui/product-card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || undefined;

  const categories = useQuery(api.categories.listCategories);
  const products = useQuery(api.products.searchProducts, {
    query: searchQuery || undefined,
    categoryId: categoryId as any,
    limit: 40,
  });

  const activeCategory = categories?.find((c) => c._id === categoryId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky search header */}
      <div className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="px-4 pt-3 pb-3">
          <h1 className="text-lg font-bold text-foreground mb-3">Explore</h1>

          {/* Search */}
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
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="Search MarketHub"
                defaultValue={searchQuery}
                className="pl-9 h-10 bg-muted/50 border-0 rounded-full"
              />
            </div>
          </form>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filters
          </button>
        </div>

        {/* Category chips */}
        {categories && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
            <Link to="/explore">
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
                to={`/explore?category=${cat._id}${searchQuery ? "&q=" + searchQuery : ""}`}
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
      </div>

      {/* Active filters */}
      {(searchQuery || activeCategory) && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-white border-b border-border">
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
      <div className="flex-1 px-4 py-4">
        {products === undefined ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                ? `No products match "${searchQuery}". Try another search.`
                : "No products available yet. Check back soon!"
            }
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {products.length} products
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
