import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminCategories() {
  const categories = useQuery(api.categories.listCategories);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Categories</h1>

      {categories === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Folder className="h-12 w-12" />}
          title="No categories yet"
          description="Create categories to organize products."
        />
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="p-4 rounded-lg border bg-card flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  /{category.slug}
                  {category.description && ` — ${category.description}`}
                </p>
              </div>
              <Badge variant={category.isActive ? "success" : "secondary"}>
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
