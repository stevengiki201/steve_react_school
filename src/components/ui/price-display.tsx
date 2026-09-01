import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({ amount, className, size = "md" }: PriceDisplayProps) {
  const formatted = `TSh ${amount.toLocaleString("en-TZ")}`;

  return (
    <span
      className={cn(
        "font-bold text-primary",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
        className,
      )}
    >
      {formatted}
    </span>
  );
}
