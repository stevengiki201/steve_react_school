import { Link } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  Store,
  ChevronRight,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, ROLE_LABELS } from "@/lib/constants";

export default function AccountPage() {
  const { user } = useAuth();
  const { signOut } = useAuthActions();

  const menuSections = [
    {
      title: "Orders & Activity",
      items: [
        { label: "My Orders", icon: Package, to: ROUTES.orders },
        { label: "Favorites", icon: Heart, to: "/account/favorites" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Profile", icon: User, to: ROUTES.profile },
        { label: "Addresses", icon: MapPin, to: "/account/addresses" },
        { label: "Payment Methods", icon: CreditCard, to: "/account/payments" },
        { label: "Notifications", icon: Bell, to: "/notifications" },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help & Support", icon: HelpCircle, to: "/help" },
        { label: "Terms of Service", icon: FileText, to: "/terms" },
        { label: "Privacy Policy", icon: Shield, to: "/privacy" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile header */}
      <div className="bg-white border-b border-border px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {user?.name || "Guest"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email || "Sign in to your account"}
            </p>
            {user && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seller action */}
      {user && user.role === "customer" && (
        <div className="px-4 py-3">
          <Link
            to="/sell"
            className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Store className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">
                Become a Seller
              </p>
              <p className="text-xs text-muted-foreground">
                Start selling on MarketHub
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      )}

      {/* Menu sections */}
      <div className="px-4 py-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-lg border bg-white overflow-hidden">
              {section.items.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                    index !== section.items.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="px-4 py-4">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}
