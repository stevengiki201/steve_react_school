import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Categories module — read-only for now.
 *
 * Admin category management can be added later.
 */

/** List all active categories, sorted by sortOrder. */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .collect()
      .then((cats) =>
        cats
          .filter((c) => c.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
  },
});

/** Get a category by slug. */
export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
