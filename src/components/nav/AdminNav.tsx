import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Megaphone,
  Folder,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";
import { MARKETHUB, ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { to: ROUTES.adminDashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.adminUsers, label: "Users", icon: Users },
  { to: ROUTES.adminSellers, label: "Sellers", icon: Store },
  { to: ROUTES.adminProducts, label: "Products", icon: Package },
  { to: ROUTES.adminOrders, label: "Orders", icon: ShoppingBag },
  { to: ROUTES.adminPayments, label: "Payments", icon: DollarSign },
  { to: ROUTES.adminCampaigns, label: "Ads", icon: Megaphone },
  { to: ROUTES.adminCategories, label: "Categories", icon: Folder },
  { to: ROUTES.adminReports, label: "Reports", icon: BarChart3 },
  { to: ROUTES.adminSettings, label: "Settings", icon: Settings },
];

export default function AdminNav() {
  const location = useLocation();
  const { signOut } = useAuthActions();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white min-h-screen fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-border">
          <Link to={ROUTES.adminDashboard} className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">{MARKETHUB.name}</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-white">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => setMobileOpen(true)} className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Admin</span>
          </div>
          <div className="w-7" />
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold">{MARKETHUB.name}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent",
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-accent w-full"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
