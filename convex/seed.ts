import { mutation } from "./_generated/server";

/**
 * Seed the database with default Tanzania marketplace categories.
 * Run once via the Convex dashboard or a one-off script.
 */
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) {
      return { message: "Categories already seeded", count: existing.length };
    }

    const categories = [
      { name: "Electronics", slug: "electronics", description: "Phones, laptops, gadgets", sortOrder: 1 },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes, accessories", sortOrder: 2 },
      { name: "Beauty & Health", slug: "beauty-health", description: "Skincare, cosmetics, wellness", sortOrder: 3 },
      { name: "Food & Groceries", slug: "food-groceries", description: "Fresh food, snacks, beverages", sortOrder: 4 },
      { name: "Home & Garden", slug: "home-garden", description: "Furniture, decor, tools", sortOrder: 5 },
      { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Fitness, outdoor gear", sortOrder: 6 },
      { name: "Baby & Kids", slug: "baby-kids", description: "Toys, clothing, baby care", sortOrder: 7 },
      { name: "Automotive", slug: "automotive", description: "Car parts, accessories", sortOrder: 8 },
      { name: "Books & Stationery", slug: "books-stationery", description: "Books, school supplies", sortOrder: 9 },
      { name: "Services", slug: "services", description: "Professional services", sortOrder: 10 },
    ];

    let count = 0;
    for (const cat of categories) {
      await ctx.db.insert("categories", {
        ...cat,
        isActive: true,
      });
      count++;
    }

    return { message: "Categories seeded successfully", count };
  },
});
