import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, ShoppingBag, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";
import { checkoutSchema } from "@/lib/validation";
import { PriceDisplay } from "@/components/ui/price-display";

type Step = "delivery" | "payment" | "confirmation";

const STEPS: { key: Step; label: string; icon: typeof Truck }[] = [
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "confirmation", label: "Done", icon: Check },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useQuery(api.cart.getCart);
  const createOrder = useMutation(api.orders.createOrder);

  const [step, setStep] = useState<Step>("delivery");
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerPhone: user?.phone || "",
    deliveryAddress: "",
    deliveryLocation: "",
    paymentMethod: "mobile_money",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  if (cart === undefined || cart === null || cart.items.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold">Cart is empty</h1>
        <Button asChild className="mt-4">
          <Link to="/explore">Browse Market</Link>
        </Button>
      </div>
    );
  }

  const handleDeliverySubmit = () => {
    setErrors({});
    if (!formData.customerName.trim()) {
      setErrors({ customerName: "Name is required" });
      return;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 9) {
      setErrors({ customerPhone: "Valid phone number is required" });
      return;
    }
    if (!formData.deliveryAddress.trim() || formData.deliveryAddress.length < 5) {
      setErrors({ deliveryAddress: "Delivery address is required" });
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = async () => {
    setOrderError("");
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryLocation: formData.deliveryLocation || undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      });
      setOrderResult(result);
      setStep("confirmation");
    } catch (error: any) {
      setOrderError(error.message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((s, i) => {
          const currentIdx = STEPS.findIndex((x) => x.key === step);
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? "bg-primary text-white"
                      : isCurrent
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: Delivery */}
      {step === "delivery" && (
        <div className="space-y-4">
          <h1 className="text-lg font-bold text-foreground">Delivery Information</h1>

          <div className="p-4 rounded-lg border bg-card space-y-3">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Your full name"
              />
              {errors.customerName && (
                <p className="text-xs text-destructive mt-1">{errors.customerName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+255 7XX XXX XXX"
              />
              {errors.customerPhone && (
                <p className="text-xs text-destructive mt-1">{errors.customerPhone}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Delivery Address</label>
              <Input
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="Street address, area, city"
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-destructive mt-1">{errors.deliveryAddress}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Landmark (optional)</label>
              <Input
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                placeholder="Near cinema, market, etc."
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleDeliverySubmit}>
            Continue to Payment
          </Button>

          <Link to="/cart" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to Cart
          </Link>
        </div>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <div className="space-y-4">
          <h1 className="text-lg font-bold text-foreground">Payment</h1>

          {/* Order summary */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {cart.items.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="line-clamp-1 flex-1">
                      {item.product.name} x{item.quantity}
                    </span>
                    <PriceDisplay amount={item.product.price * item.quantity} size="sm" className="ml-2 shrink-0" />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <PriceDisplay amount={2000} size="sm" />
            </div>
            <div className="flex justify-between font-bold mt-1 pt-1 border-t">
              <span>Total</span>
              <PriceDisplay amount={cart.subtotal + 2000} />
            </div>
          </div>

          {/* Payment method */}
          <div className="p-4 rounded-lg border bg-card space-y-2">
            <h2 className="text-sm font-semibold">Select payment method</h2>
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.paymentMethod === method.value
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="h-4 w-4 text-primary"
                />
                <span className="text-sm">{method.label}</span>
              </label>
            ))}
          </div>

          {/* Notes */}
          <div className="p-4 rounded-lg border bg-card">
            <label className="text-sm font-medium">Order Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions for delivery..."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px]"
            />
          </div>

          {orderError && <p className="text-sm text-destructive">{orderError}</p>}

          <Button className="w-full" onClick={handlePaymentSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Pay Now"}
          </Button>

          <button
            onClick={() => setStep("delivery")}
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Delivery
          </button>
        </div>
      )}

      {/* Step: Confirmation */}
      {step === "confirmation" && orderResult && (
        <div className="text-center py-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Order Received!</h1>
          <p className="text-sm text-muted-foreground">
            Order #{orderResult.orderNumber}
          </p>
          <PriceDisplay amount={cart.subtotal + 2000} size="lg" />

          <div className="space-y-2 pt-4">
            <Button className="w-full" asChild>
              <Link to={`/orders/${orderResult.orderId}`}>Track Order</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/explore">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
