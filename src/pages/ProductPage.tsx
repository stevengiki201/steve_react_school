import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Store,
  MapPin,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  Truck,
  Share2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROUTES, formatPrice } from "@/lib/constants";
import { useConvexAuth } from "convex/react";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const product = useQuery(
    api.products.getProductBySlug,
    slug ? { slug } : "skip",
  );
  const addToCart = useMutation(api.cart.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          This product may have been removed or doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link to="/explore">Browse Market</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = `/auth?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({ productId: product._id, quantity });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      window.location.href = `/auth?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({ productId: product._id, quantity });
      navigate("/checkout");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on MarketHub - ${formatPrice(product.price)}`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
      {/* Mobile back + actions bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Share product"
          >
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Share toast */}
      {showShareToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium z-50 shadow-lg">
          Link copied to clipboard!
        </div>
      )}

      {/* Breadcrumb (desktop) */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/explore" className="hover:text-foreground flex items-center gap-1">
          Market
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/explore?category=${product.category._id}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-lg border bg-muted overflow-hidden relative">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Store className="h-16 w-16" />
              </div>
            )}
            {product.images.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {selectedImage + 1} / {product.images.length}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img._id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded-md border overflow-hidden shrink-0 transition-all ${
                    i === selectedImage
                      ? "ring-2 ring-primary ring-offset-1"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{product.name}</h1>

          <p className="mt-2 text-2xl md:text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          {/* Stock */}
          <div className="mt-3">
            {product.stockQuantity > 0 ? (
              <Badge variant="success">
                In Stock ({product.stockQuantity} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="mt-3 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({product.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Description */}
          <div className="mt-4">
            <h2 className="text-sm font-medium text-foreground mb-2">
              Description
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity + Actions */}
          {product.stockQuantity > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-9 w-12 flex items-center justify-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stockQuantity, quantity + 1))
                    }
                    className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 h-11"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="default"
                  className="flex-1 h-11 bg-primary/90 hover:bg-primary"
                  onClick={handleBuyNow}
                  disabled={isAdding}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
            <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Delivery</p>
              <p>Delivery available. Exact costs shown at checkout.</p>
            </div>
          </div>

          {/* Seller info */}
          {product.seller && (
            <div className="mt-6 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-foreground">
                      {product.seller.businessName}
                    </h3>
                    {product.seller.isVerified && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {product.seller.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {product.seller.location}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/store/${product.seller._id}`}>View Store</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
