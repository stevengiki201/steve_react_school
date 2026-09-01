import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES, CURRENCY } from "@/lib/constants";
import { createProductSchema } from "@/lib/validation";

export default function SellerProductNew() {
  const navigate = useNavigate();
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const categories = useQuery(api.categories.listCategories);
  const createProduct = useMutation(api.products.createProduct);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stockQuantity: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    if (!sellerProfile) {
      setSubmitError("You need a seller profile first.");
      return;
    }

    const result = createProductSchema.safeParse({
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        sellerId: sellerProfile._id,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: formData.categoryId as any,
        stockQuantity: Number(formData.stockQuantity),
        location: formData.location || undefined,
      });
      navigate(ROUTES.sellerProducts, { replace: true });
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Link
        to={ROUTES.sellerProducts}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <div>
            <label className="text-sm font-medium">Product Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Samsung Galaxy S24"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product..."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Price ({CURRENCY}) *</label>
              <Input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 250000"
              />
              {errors.price && (
                <p className="text-xs text-destructive mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Stock Quantity *</label>
              <Input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="e.g. 10"
              />
              {errors.stockQuantity && (
                <p className="text-xs text-destructive mt-1">{errors.stockQuantity}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Location (optional)</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Dar es Salaam"
            />
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Publish Product"}
        </Button>
      </form>
    </div>
  );
}
