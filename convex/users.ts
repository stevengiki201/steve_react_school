import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Users module — queries and mutations for user management.
 *
 * Handles: profile CRUD, role-based lookups, seller profile management.
 */

// ==========================================
// QUERIES
// ==========================================

/** Get the current authenticated user. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) return null;
    return user;
  },
});

/** Get a user by ID (admin only — no auth check here, client guards). */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/** Get the seller profile for the current user. */
export const getSellerProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user || user.role !== "seller") return null;

    const profile = await ctx.db
      .query("sellerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return profile;
  },
});

/** Get a seller profile by seller ID (for public store pages). */
export const getSellerProfileById = query({
  args: { sellerId: v.id("sellerProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sellerId);
  },
});

/** List all users (admin). */
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/** List all sellers with their profiles (admin). */
export const getAllSellers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sellerProfiles").collect();
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/** Create or update the current user's profile after first sign-in. */
export const ensureUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("seller"),
      v.literal("admin"),
    ),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (existing) {
      // Update if needed
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        role: args.role,
        phone: args.phone,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      phone: args.phone,
      isActive: true,
      authId: identity.subject,
    });

    // If registering as seller, auto-create a seller profile
    if (args.role === "seller") {
      await ctx.db.insert("sellerProfiles", {
        userId,
        businessName: args.name + "'s Store",
        location: "Tanzania",
        isVerified: false,
        rating: 0,
        totalSales: 0,
        totalOrders: 0,
        isActive: true,
      });
    }

    return userId;
  },
});

/** Update the current user's profile. */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.location !== undefined) updates.location = args.location;
    if (args.avatar !== undefined) updates.avatar = args.avatar;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

/** Create a seller profile for the current user. */
export const createSellerProfile = mutation({
  args: {
    businessName: v.string(),
    businessDescription: v.optional(v.string()),
    location: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "seller") {
      // Upgrade role to seller
      await ctx.db.patch(user._id, { role: "seller" });
    }

    // Check if seller profile already exists
    const existing = await ctx.db
      .query("sellerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) throw new Error("Seller profile already exists");

    const profileId = await ctx.db.insert("sellerProfiles", {
      userId: user._id,
      businessName: args.businessName,
      businessDescription: args.businessDescription,
      location: args.location,
      logo: args.logo,
      isVerified: false,
      rating: 0,
      totalSales: 0,
      totalOrders: 0,
      isActive: true,
    });

    return profileId;
  },
});
