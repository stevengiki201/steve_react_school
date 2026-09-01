import { useState } from "react";
import { User, Store, Bell, CreditCard, Shield, LogOut, ChevronRight } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SellerSettings() {
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const updateProfile = useMutation(api.users.updateProfile);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: sellerProfile?.location || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const menuSections = [
    {
      title: "Business",
      items: [
        { label: "Business Profile", icon: Store, to: "/seller/profile" },
        { label: "Payment Settings", icon: CreditCard, to: "#" },
        { label: "Notifications", icon: Bell, to: "#" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Security", icon: Shield, to: "#" },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>

      {/* Profile card */}
      <div className="p-4 rounded-lg border bg-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+255 7XX XXX XXX"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Region"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Menu sections */}
      <div className="space-y-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-lg border bg-card overflow-hidden">
              {section.items.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                    index !== section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
