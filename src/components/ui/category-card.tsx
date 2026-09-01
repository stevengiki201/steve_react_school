import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
  className?: string;
}

export function CategoryCard({ _id, name, className }: CategoryCardProps) {
  return (
    <Link
      to={`/explore?category=${_id}`}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-center",
        className,
      )}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Store className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground line-clamp-2">
        {name}
      </span>
    </Link>
  );
}
