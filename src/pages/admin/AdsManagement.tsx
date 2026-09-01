import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminAdsManagement() {
  // For MVP, show a placeholder since campaigns require seller data
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Ad Campaigns</h1>

      <EmptyState
        icon={<Megaphone className="h-12 w-12" />}
        title="Campaign management"
        description="View and manage advertising campaigns across the platform. Campaign data will appear here as sellers create them."
      />
    </div>
  );
}
