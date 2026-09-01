import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  BarChart3,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";
import { MARKETHUB, ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { to: ROUTES.sellerDashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.sellerProducts, label: "Products", icon: Package },
  { to: ROUTES.sellerOrders, label: "Orders", icon: ShoppingBag },
  { to: ROUTES.sellerCampaigns, label: "Ads", icon: Megaphone },
  { to: ROUTES.sellerAnalytics, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.sellerSettings, label: "Settings", icon: Settings },
];

export default function SellerNav() {
  const location = useLocation();
  const { signOut } = useAuthActions();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white min-h-screen fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-border">
          <Link to={ROUTES.sellerDashboard} className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">{MARKETHUB.name}</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Seller Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
