import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Shield, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryCard } from "@/components/ui/category-card";
import { MARKETHUB } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useQuery(api.categories.listCategories);
  const featuredProducts = useQuery(api.products.getFeaturedProducts, {
    limit: 8,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header with search */}
      <div className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {MARKETHUB.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-accent"
              >
                <span className="text-lg">🛒</span>
              </Link>
              <Link
                to="/notifications"
                className="p-2 rounded-full hover:bg-accent"
              >
                <span className="text-lg">🔔</span>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products & businesses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-0 rounded-full"
              />
            </div>
          </form>

          {/* Location */}
          <button className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground">
            <MapPin className="h-3 w-3" />
            <span>Tanzania</span>
            <span className="text-primary font-medium">Change</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <section className="px-4 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Categories</h2>
              <Link
                to="/explore"
                className="text-xs text-primary font-medium flex items-center gap-0.5"
              >
                See all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {categories.slice(0, 6).map((cat) => (
                <CategoryCard key={cat._id} {...cat} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="px-4 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">
                🔥 Featured
              </h2>
              <Link
                to="/explore"
                className="text-xs text-primary font-medium flex items-center gap-0.5"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* Trust signals */}
        <section className="px-4 pt-8 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <Shield className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="text-sm font-semibold text-foreground">
                Verified Sellers
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Every seller is reviewed before listing
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
              <span className="text-lg mb-2 block">📊</span>
              <h3 className="text-sm font-semibold text-foreground">
                Real Results
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sellers see how ads create real sales
              </p>
            </div>
          </div>
        </section>

        {/* Empty state if no products */}
        {featuredProducts && featuredProducts.length === 0 && (
          <section className="px-4 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              No products yet. Check back soon!
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
