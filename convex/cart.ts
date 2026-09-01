import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Cart module — shopping cart management.
 *
 * One cart per user. Server-authoritative pricing.
 */

// ==========================================
// QUERIES
// ==========================================

/** Get the current user's cart with items and product details. */
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) return null;

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!cart) return null;

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    // Enrich each item with product details
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const images = product
          ? await ctx.db
              .query("productImages")
              .withIndex("by_product", (q: any) =>
                q.eq("productId", product._id),
              )
              .collect()
          : [];

        const primaryImage = images.find((i: any) => i.isPrimary) || images[0];

        return {
          ...item,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                currency: product.currency,
                stockQuantity: product.stockQuantity,
              }
            : null,
          primaryImage: primaryImage || null,
        };
      }),
    );

    // Calculate subtotal (server-authoritative)
    let subtotal = 0;
    let itemCount = 0;
    for (const item of items) {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
        itemCount += item.quantity;
      }
    }

    return {
      _id: cart._id,
      userId: cart.userId,
      items,
      subtotal,
      itemCount,
      createdAt: cart._creationTime,
      updatedAt: cart._creationTime,
    };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/** Add an item to the cart (or increment quantity if already exists). */
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate product exists and is in stock
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (!product.isActive) throw new Error("Product is not available");
    if (product.stockQuantity < args.quantity) {
      throw new Error("Not enough stock");
    }

    // Get or create cart
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!cart) {
      const cartId = await ctx.db.insert("carts", { userId: user._id });
      cart = await ctx.db.get(cartId);
    }

    if (!cart) throw new Error("Failed to create cart");

    // Check if item already in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_product", (q) =>
        q.eq("cartId", cart!._id).eq("productId", args.productId),
      )
      .unique();

    if (existingItem) {
      const newQty = existingItem.quantity + args.quantity;
      if (newQty > product.stockQuantity) {
        throw new Error("Not enough stock for requested quantity");
      }
      await ctx.db.patch(existingItem._id, { quantity: newQty });
    } else {
      await ctx.db.insert("cartItems", {
        cartId: cart._id,
        productId: args.productId,
        quantity: args.quantity,
        addedAt: Date.now(),
      });
    }

    return cart._id;
  },
});

/** Update cart item quantity. */
export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.cartItemId);
    if (!item) throw new Error("Cart item not found");

    const product = await ctx.db.get(item.productId);
    if (!product) throw new Error("Product not found");

    if (args.quantity <= 0) {
      // Remove item if quantity is 0 or less
      await ctx.db.delete(args.cartItemId);
      return;
    }

    if (args.quantity > product.stockQuantity) {
      throw new Error("Not enough stock");
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

/** Remove an item from the cart. */
export const removeFromCart = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.cartItemId);
    if (!item) throw new Error("Cart item not found");

    await ctx.db.delete(args.cartItemId);
  },
});
