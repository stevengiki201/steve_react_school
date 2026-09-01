import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Advertisements module — campaign management and analytics.
 *
 * This is MarketHub's core differentiator:
 * connecting advertising spend to actual sales.
 */

// ==========================================
// QUERIES
// ==========================================

/** Get campaigns for a seller. */
export const getSellerCampaigns = query({
  args: { sellerId: v.id("sellerProfiles") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("advertisementCampaigns")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    // Enrich with product info
    return await Promise.all(
      campaigns.map(async (campaign) => {
        const product = await ctx.db.get(campaign.productId);
        return {
          ...campaign,
          product: product
            ? { name: product.name, slug: product.slug }
            : null,
        };
      }),
    );
  },
});

/** Get campaign analytics (for a single campaign). */
export const getCampaignAnalytics = query({
  args: { campaignId: v.id("advertisementCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;

    const events = await ctx.db
      .query("advertisementEvents")
      .withIndex("by_campaign", (q) =>
        q.eq("campaignId", args.campaignId),
      )
      .collect();

    const impressions = events.filter((e) => e.eventType === "impression").length;
    const clicks = events.filter((e) => e.eventType === "click").length;
    const addToCarts = events.filter((e) => e.eventType === "add_to_cart").length;
    const purchases = events.filter((e) => e.eventType === "purchase").length;

    const conversionRate = clicks > 0 ? (purchases / clicks) * 100 : 0;

    return {
      campaign,
      impressions,
      clicks,
      addToCarts,
      purchaseCount: purchases,
      spend: campaign.spent,
      conversionRate,
    };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/** Create a new advertising campaign. */
export const createCampaign = mutation({
  args: {
    sellerId: v.id("sellerProfiles"),
    productId: v.id("products"),
    name: v.string(),
    budget: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    targetLocation: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify seller ownership
    const profile = await ctx.db.get(args.sellerId);
    if (!profile) throw new Error("Seller profile not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user || profile.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Verify product belongs to seller
    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== args.sellerId) {
      throw new Error("Product not found or not owned by seller");
    }

    const campaignId = await ctx.db.insert("advertisementCampaigns", {
      sellerId: args.sellerId,
      productId: args.productId,
      name: args.name,
      budget: args.budget,
      spent: 0,
      currency: "TZS",
      startDate: args.startDate,
      endDate: args.endDate,
      status: "draft",
      targetLocation: args.targetLocation,
      targetCategory: args.targetCategory,
    });

    return campaignId;
  },
});

/** Track an ad event (impression, click, etc.). */
export const trackEvent = mutation({
  args: {
    campaignId: v.id("advertisementCampaigns"),
    eventType: v.union(
      v.literal("impression"),
      v.literal("click"),
      v.literal("add_to_cart"),
      v.literal("purchase"),
    ),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "active") return; // Only track active campaigns

    await ctx.db.insert("advertisementEvents", {
      campaignId: args.campaignId,
      eventType: args.eventType,
      productId: args.productId,
    });

    // Update spend on click/purchase
    if (args.eventType === "click") {
      const costPerClick = 50; // TSh 50 per click
      const newSpent = campaign.spent + costPerClick;
      if (newSpent >= campaign.budget) {
        await ctx.db.patch(args.campaignId, {
          spent: newSpent,
          status: "completed",
        });
      } else {
        await ctx.db.patch(args.campaignId, { spent: newSpent });
      }
    }

    if (args.eventType === "purchase") {
      const costPerConversion = 100; // TSh 100 per purchase
      const newSpent = campaign.spent + costPerConversion;
      await ctx.db.patch(args.campaignId, { spent: newSpent });
    }
  },
});
