import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Store, Package, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, ROLE_LABELS } from "@/lib/constants";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const updateProfile = useMutation(api.users.updateProfile);
  const { signOut } = useAuthActions();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-bold text-foreground mb-4">Edit Profile</h1>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            {user.avatar ? (
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
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+255 7XX XXX XXX"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Region"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Link
          to={ROUTES.orders}
          className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
        >
          <Package className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <span className="font-medium">My Orders</span>
            <p className="text-xs text-muted-foreground">
              View order history and track deliveries
            </p>
          </div>
        </Link>

        {user.role === "seller" && (
          <Link
            to={ROUTES.sellerDashboard}
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <Store className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="font-medium">Seller Dashboard</span>
              <p className="text-xs text-muted-foreground">
                Manage your products and orders
              </p>
            </div>
          </Link>
        )}

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="font-medium text-destructive">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
