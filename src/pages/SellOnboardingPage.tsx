import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export default function SellOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    if (!formData.businessName.trim() || formData.businessName.length < 2) {
      setErrors({ businessName: "Business name is required (min 2 characters)" });
      return;
    }
    if (!formData.location.trim() || formData.location.length < 2) {
      setErrors({ location: "Location is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      // First, upgrade the user to seller role
      if (user) {
        await ensureUser({
          name: user.name,
          email: user.email,
          role: "seller",
          phone: user.phone,
        });
      }
      navigate(ROUTES.sellerDashboard, { replace: true });
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create seller account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center mb-6">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Become a Seller</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start selling on MarketHub and reach customers across Tanzania
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <div>
            <label className="text-sm font-medium">Business Name *</label>
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. ABC Fashion"
            />
            {errors.businessName && (
              <p className="text-xs text-destructive mt-1">{errors.businessName}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Business Description</label>
            <textarea
              value={formData.businessDescription}
              onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
              placeholder="Tell customers about your business..."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location *</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Dar es Salaam"
            />
            {errors.location && (
              <p className="text-xs text-destructive mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Start Selling"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your seller account will be reviewed for verification.
        </p>
      </form>
    </div>
  );
}
