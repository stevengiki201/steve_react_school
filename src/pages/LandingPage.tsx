import { Link } from "react-router-dom";
import { Search, Shield, TrendingUp, Store, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, formatPrice } from "@/lib/constants";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LandingPage() {
  const categories = useQuery(api.categories.listCategories);
  const featuredProducts = useQuery(api.products.getFeaturedProducts, {
    limit: 6,
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Discover. Buy.{" "}
            <span className="text-primary">Trust.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            The marketplace where verified sellers meet real customers.
            Shop locally in Tanzania with confidence.
          </p>

          <div className="mt-8 max-w-lg mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const q = form.get("q") as string;
                if (q?.trim()) {
                  window.location.href = `${ROUTES.market}?q=${encodeURIComponent(q.trim())}`;
                }
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-base"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
              </Button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" />
              Verified Sellers
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              Real Results
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Browse Categories
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat._id}
                  to={`${ROUTES.market}?category=${cat._id}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-center"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-8 sm:py-12 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Featured Products
              </h2>
              <Link
                to={ROUTES.market}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {featuredProducts.map((product) => {
                const primaryImage = product.images?.find(
                  (i: any) => i.isPrimary,
                ) ?? product.images?.[0];

                return (
                  <Link
                    key={product._id}
                    to={`${ROUTES.market}/../product/${product.slug}`}
                    className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-muted">
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
          </div>
        </section>
      )}

      {/* Value Propositions */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-semibold text-foreground text-center mb-8">
            Why MarketHub?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Verified Sellers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Every seller is reviewed. Shop with confidence knowing who you're
                buying from.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Real Advertising Results
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sellers see exactly what their promotions produce. Better ads
                mean better products for you.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Trust & Transparency
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clear prices, real reviews, and reliable order tracking from
                purchase to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to start selling?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join MarketHub and turn your advertising into measurable sales.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to={ROUTES.auth}>Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
