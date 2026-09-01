import { Link } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROUTES, CAMPAIGN_STATUS_LABELS } from "@/lib/constants";
import { PriceDisplay } from "@/components/ui/price-display";

export default function SellerCampaigns() {
  const sellerProfile = useQuery(api.users.getSellerProfile);
  const campaigns = useQuery(
    api.advertisements.getSellerCampaigns,
    sellerProfile ? { sellerId: sellerProfile._id } : "skip",
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Advertising Campaigns
        </h1>
        <Button asChild>
          <Link to={ROUTES.sellerCampaignNew}>
            <Plus className="h-4 w-4 mr-1" />
            New Campaign
          </Link>
        </Button>
      </div>

      {campaigns === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-12 w-12" />}
          title="No campaigns yet"
          description="Promote your products and track advertising results."
          action={
            <Button asChild>
              <Link to={ROUTES.sellerCampaignNew}>Create Campaign</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Product: {(campaign as any).product?.name || campaign.productId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Budget: <PriceDisplay amount={campaign.budget} size="sm" /> | Spent:{" "}
                    <PriceDisplay amount={campaign.spent} size="sm" />
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      campaign.status === "active"
                        ? "success"
                        : campaign.status === "paused"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((campaign.spent / campaign.budget) * 100)}% of budget used
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
