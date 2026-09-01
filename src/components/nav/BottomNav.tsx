import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/account", label: "Account", icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const cart = useQuery(api.cart.getCart);
  const cartCount = cart?.itemCount ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white safe-area-bottom">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/home" && location.pathname === "/");

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {item.to === "/cart" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
