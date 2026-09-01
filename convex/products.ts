import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Products module — CRUD, search, and listing.
 *
 * All price calculations are server-authoritative.
 */

// ==========================================
// HELPERS
// ==========================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ==========================================
// QUERIES
// ==========================================

/** Get featured products (for landing page). */
export const getFeaturedProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;

    const products = await ctx.db
      .query("products")
      .withIndex("by_isFeatured", (q) => q.eq("isFeatured", true))
      .collect();

    // Filter active only
    const active = products.filter((p) => p.isActive).slice(0, limit);

    // Enrich with images and seller info
    return await enrichProducts(ctx, active);
  },
});

/** Search products by query text and/or category. */
export const searchProducts = query({
  args: {
    query: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 40;

    let products: any[];

    if (args.categoryId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) =>
          q.eq("categoryId", args.categoryId as any),
        )
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    // Filter active
    let results = products.filter((p) => p.isActive);

    // Text search filter
    if (args.query && args.query.trim()) {
      const q = args.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q))),
      );
    }

    return (await enrichProducts(ctx, results)).slice(0, limit);
  },
});

/** Get a single product by slug. */
export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!product) return null;

    const images = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();

    images.sort((a, b) => a.sortOrder - b.sortOrder);

    const sellerProfile = await ctx.db.get(product.sellerId);

    const category = await ctx.db.get(product.categoryId);

    return {
      ...product,
      images,
      seller: sellerProfile
        ? {
            _id: sellerProfile._id,
            businessName: sellerProfile.businessName,
            isVerified: sellerProfile.isVerified,
            location: sellerProfile.location,
          }
        : null,
      category,
    };
  },
});

/** List all products (admin). */
export const listProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const products = await ctx.db.query("products").collect();
    return (await enrichProducts(ctx, products)).slice(0, limit);
  },
});

/** Get products by seller. */
export const getProductsBySeller = query({
  args: {
    sellerId: v.id("sellerProfiles"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    if (!args.includeInactive) {
      products = products.filter((p) => p.isActive);
    }

    // For list view, return without images (lighter payload)
    return products;
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/** Create a new product (seller only). */
export const createProduct = mutation({
  args: {
    sellerId: v.id("sellerProfiles"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
    stockQuantity: v.number(),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
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
      throw new Error("Not authorized to create products for this seller");
    }

    // Verify category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    // Generate unique slug
    let baseSlug = slugify(args.name);
    let slug = baseSlug;
    let counter = 1;
    while (await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).unique()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const productId = await ctx.db.insert("products", {
      sellerId: args.sellerId,
      name: args.name,
      slug,
      description: args.description,
      price: args.price,
      currency: "TZS",
      categoryId: args.categoryId,
      stockQuantity: args.stockQuantity,
      isActive: true,
      isFeatured: false,
      averageRating: 0,
      totalReviews: 0,
      totalSales: 0,
      location: args.location,
      tags: args.tags,
    });

    return { productId, slug };
  },
});

/** Deactivate a product (seller only, soft delete). */
export const deactivateProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const profile = await ctx.db.get(product.sellerId);
    if (!profile) throw new Error("Seller profile not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user || profile.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.productId, { isActive: false });
    return args.productId;
  },
});

// ==========================================
// INTERNAL HELPERS
// ==========================================

/** Enrich products with images and basic seller info. */
async function enrichProducts(ctx: any, products: any[]) {
  const enriched = await Promise.all(
    products.map(async (product) => {
      const images = await ctx.db
        .query("productImages")
        .withIndex("by_product", (q: any) => q.eq("productId", product._id))
        .collect();

      images.sort((a: any, b: any) => a.sortOrder - b.sortOrder);

      const sellerProfile = await ctx.db.get(product.sellerId);

      return {
        ...product,
        images,
        seller: sellerProfile
          ? {
              businessName: sellerProfile.businessName,
              isVerified: sellerProfile.isVerified,
            }
          : null,
      };
    }),
  );

  return enriched;
}
