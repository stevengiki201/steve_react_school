import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, Store, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, MARKETHUB } from "@/lib/constants";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.market}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-2 shrink-0">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground hidden sm:block">
              {MARKETHUB.name}
            </span>
          </Link>

          {/* Search - hidden on very small screens */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-md"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </form>

          <div className="flex-1 sm:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.cart} className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            {/* Auth */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-1">
                {user.role === "seller" && (
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to={ROUTES.sellerDashboard}>
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                {user.role === "admin" && (
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to={ROUTES.adminDashboard}>
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.profile}>
                    <Avatar
                      src={user.avatar}
                      fallback={user.name}
                      size="sm"
                    />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button size="sm" asChild>
                <Link to={ROUTES.auth}>Sign In</Link>
              </Button>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </form>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t">
            <div className="flex flex-col gap-1 pt-3">
              <Link
                to={ROUTES.market}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Market
              </Link>
              <Link
                to={ROUTES.cart}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cart
              </Link>
              {isAuthenticated && user?.role === "seller" && (
                <Link
                  to={ROUTES.sellerDashboard}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seller Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to={ROUTES.adminDashboard}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to={ROUTES.profile}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to={ROUTES.orders}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
