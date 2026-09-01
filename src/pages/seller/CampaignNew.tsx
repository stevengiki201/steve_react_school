import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES, formatPrice } from "@/lib/constants";

export default function CampaignNew() {
  const navigate = useNavigate();
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const products = useQuery(
    api.products.getProductsBySeller,
    sellerProfile ? { sellerId: sellerProfile._id, includeInactive: false } : "skip",
  );
  const createCampaign = useMutation(api.advertisements.createCampaign);

  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    budget: "",
    duration: "7",
    targetLocation: "",
    targetCategory: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const estimatedReach = (() => {
    const budget = parseInt(formData.budget) || 0;
    if (budget <= 0) return null;
    const low = Math.round(budget / 100);
    const high = Math.round(budget / 50);
    return { low, high };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const newErrors: Record<string, string> = {};
    if (!formData.productId) newErrors.productId = "Select a product";
    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    const budget = parseInt(formData.budget);
    if (!budget || budget < 5000) newErrors.budget = "Minimum budget is TSh 5,000";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const durationDays = parseInt(formData.duration) || 7;
      await createCampaign({
        sellerId: sellerProfile!._id,
        productId: formData.productId as any,
        name: formData.name,
        budget,
        startDate: now,
        endDate: now + durationDays * 24 * 60 * 60 * 1000,
        targetLocation: formData.targetLocation || undefined,
        targetCategory: formData.targetCategory || undefined,
      });
      navigate(ROUTES.sellerCampaigns);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sellerProfile) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Create Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product selection */}
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Megaphone className="h-4 w-4 text-primary" />
            Choose product to promote
          </div>
          <div>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a product</option>
              {products?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {formatPrice(p.price)}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs text-destructive mt-1">{errors.productId}</p>
            )}
          </div>
        </div>

        {/* Campaign details */}
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h2 className="text-sm font-medium">Campaign Details</h2>
          <div>
            <label className="text-xs text-muted-foreground">Campaign name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Summer Sneakers Promotion"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Budget (TSh)</label>
            <Input
              type="number"
              min={5000}
              step={1000}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Minimum TSh 5,000"
            />
            {errors.budget && (
              <p className="text-xs text-destructive mt-1">{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Duration + Location */}
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h2 className="text-sm font-medium">Targeting</h2>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3" /> Target location (optional)
            </label>
            <Input
              value={formData.targetLocation}
              onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
              placeholder="e.g. Dar es Salaam, Mbeya"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Tag className="h-3 w-3" /> Target category (optional)
            </label>
            <Input
              value={formData.targetCategory}
              onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
              placeholder="e.g. Fashion, Electronics"
            />
          </div>
        </div>

        {/* Estimated reach */}
        {estimatedReach && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm font-medium text-foreground">Estimated reach</p>
            <p className="text-lg font-bold text-primary mt-1">
              {estimatedReach.low.toLocaleString()} – {estimatedReach.high.toLocaleString()} views
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This is an estimate, not a guarantee.
            </p>
          </div>
        )}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting ? "Starting Campaign..." : "Start Campaign"}
        </Button>
      </form>
    </div>
  );
}
