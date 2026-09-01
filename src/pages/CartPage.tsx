import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROUTES } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function CartPage() {
  const cart = useQuery(api.cart.getCart);
  const updateQuantity = useMutation(api.cart.updateCartItem);
  const removeItem = useMutation(api.cart.removeFromCart);

  if (cart === undefined) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="px-4 py-6">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Your cart is empty"
          description="Browse the marketplace and add some products."
          action={
            <Button asChild>
              <Link to="/explore">Browse Market</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // Group items by seller
  const itemsBySeller = cart.items.reduce((acc: any, item) => {
    if (!item.product) return acc;
    const sellerName = "Seller";
    if (!acc[sellerName]) acc[sellerName] = [];
    acc[sellerName].push(item);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-bold text-foreground mb-4">
        My Cart ({cart.itemCount} items)
      </h1>

      <div className="space-y-4">
        {Object.entries(itemsBySeller).map(([sellerName, items]: [string, any]) => (
          <div key={sellerName}>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {sellerName}
            </p>
            <div className="space-y-2">
              {items.map((item: any) => {
                if (!item.product) return null;
                return (
                  <div
                    key={item._id}
                    className="flex gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="h-20 w-20 rounded-md bg-muted overflow-hidden shrink-0">
                      {item.primaryImage ? (
                        <img
                          src={item.primaryImage.url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-sm font-medium text-foreground hover:underline line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <PriceDisplay amount={item.product.price} size="sm" className="mt-1 block" />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity({
                                cartItemId: item._id,
                                quantity: item.quantity - 1,
                              })
                            }
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-8 w-10 flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity({
                                cartItemId: item._id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <PriceDisplay amount={item.product.price * item.quantity} size="sm" />
                          <button
                            onClick={() => removeItem({ cartItemId: item._id })}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <PriceDisplay amount={cart.subtotal} size="sm" />
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold mt-3 pt-3 border-t">
          <span>Total</span>
          <PriceDisplay amount={cart.subtotal} />
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link to="/explore">Continue Shopping</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link to="/checkout">
            Checkout
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="h-4" />
    </div>
  );
}
