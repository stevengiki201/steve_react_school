import { Link } from "react-router-dom";
import { Store, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./price-display";

interface ProductCardProps {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: { url: string; isPrimary: boolean }[];
  seller?: { businessName: string; isVerified: boolean } | null;
  location?: string;
  isFeatured?: boolean;
  className?: string;
}

export function ProductCard({
  slug,
  name,
  price,
  images,
  seller,
  isFeatured,
  className,
}: ProductCardProps) {
  const primaryImage = images?.find((i) => i.isPrimary) ?? images?.[0];

  return (
    <Link
      to={`/product/${slug}`}
      className={cn(
        "group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow",
        className,
      )}
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Store className="h-8 w-8" />
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white">
            Featured
          </span>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {name}
        </h3>
        <PriceDisplay amount={price} size="sm" className="mt-1" />
        {seller && (
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            {seller.isVerified && (
              <Shield className="h-3 w-3 text-green-600" />
            )}
            {seller.businessName}
          </p>
        )}
      </div>
    </Link>
  );
}
