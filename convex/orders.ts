import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Orders module — order lifecycle management.
 *
 * Order state machine:
 * PENDING_PAYMENT → PAID → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
 *                   ↘ CANCELLED
 *                     ↘ REFUNDED (from PAID or DELIVERED)
 */

// ==========================================
// HELPERS
// ==========================================

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `MH`;
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["confirmed", "cancelled", "refunded"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_delivery", "shipped", "cancelled"],
  ready_for_delivery: ["shipped", "delivered"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

// ==========================================
// QUERIES
// ==========================================

/** Get orders for the current customer. */
export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", user._id))
      .collect();

    // Sort by creation time descending
    orders.sort((a, b) => b._creationTime - a._creationTime);

    return orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: order.currency,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order._creationTime,
      updatedAt: order._creationTime,
    }));
  },
});

/** Get orders for a seller (orders containing their products). */
export const getOrdersBySeller = query({
  args: {
    sellerId: v.id("sellerProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Find order items belonging to this seller
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    // Get unique order IDs
    const orderIds = [...new Set(orderItems.map((i) => i.orderId))];

    // Fetch orders
    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        // Get customer info
        const customer = await ctx.db.get(order.customerId);

        // Get items for this order from this seller
        const items = orderItems.filter((i) => i.orderId === orderId);

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          currency: order.currency,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customer: customer
            ? { name: customer.name, phone: customer.phone }
            : null,
          items,
          createdAt: order._creationTime,
        };
      }),
    );

    return orders
      .filter(Boolean)
      .sort((a, b) => b!.createdAt - a!.createdAt)
      .slice(0, limit);
  },
});

/** Get all orders (admin). */
export const getAllOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const orders = await ctx.db.query("orders").collect();

    return orders
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit)
      .map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        createdAt: order._creationTime,
      }));
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/** Create an order from the current user's cart. */
export const createOrder = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryAddress: v.string(),
    deliveryLocation: v.optional(v.string()),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get cart
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!cart) throw new Error("Cart not found");

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    if (cartItems.length === 0) throw new Error("Cart is empty");

    // Validate all products and calculate totals (server-authoritative)
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of cartItems) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product not available: ${item.productId}`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      // Get first image
      const images = await ctx.db
        .query("productImages")
        .withIndex("by_product", (q: any) => q.eq("productId", product._id))
        .collect();

      const primaryImage = images.find((i: any) => i.isPrimary) || images[0];

      orderItemsData.push({
        productId: product._id,
        sellerId: product.sellerId,
        productName: product.name,
        productImage: primaryImage?.url,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        currency: product.currency,
      });
    }

    // Delivery fee (flat rate for MVP)
    const deliveryFee = 2000;
    const total = subtotal + deliveryFee;

    // Create order
    const orderNumber = generateOrderNumber();
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      customerId: user._id,
      status: "pending_payment",
      subtotal,
      deliveryFee,
      total,
      currency: "TZS",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      deliveryAddress: args.deliveryAddress,
      deliveryLocation: args.deliveryLocation,
      paymentMethod: args.paymentMethod,
      notes: args.notes,
    });

    // Create order items and update stock
    for (const itemData of orderItemsData) {
      await ctx.db.insert("orderItems", {
        orderId,
        ...itemData,
      });

      // Decrement stock
      const product = await ctx.db.get(itemData.productId as any);
      if (product) {
        const stock = (product as any).stockQuantity as number;
        if (stock !== undefined) {
          await ctx.db.patch(product._id, {
            stockQuantity: stock - itemData.quantity,
          });
        }
      }
    }

    // Create payment record (pending)
    await ctx.db.insert("payments", {
      orderId,
      amount: total,
      currency: "TZS",
      method: args.paymentMethod,
      status: "pending",
    });

    // Clear the cart
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { orderId, orderNumber };
  },
});

/** Update order status (seller/admin). */
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready_for_delivery"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Validate state transition
    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(args.status)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${args.status}`,
      );
    }

    await ctx.db.patch(args.orderId, { status: args.status });

    // Update seller stats when order is delivered
    if (args.status === "delivered") {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
        .collect();

      for (const item of orderItems) {
        const sellerProfile = await ctx.db.get(item.sellerId);
        if (sellerProfile) {
          await ctx.db.patch(item.sellerId, {
            totalOrders: sellerProfile.totalOrders + 1,
            totalSales: sellerProfile.totalSales + item.totalPrice,
          });
        }
      }
    }

    return args.orderId;
  },
});
