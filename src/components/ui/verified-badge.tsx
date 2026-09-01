import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-green-600",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      <Shield className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      Verified
    </span>
  );
}
