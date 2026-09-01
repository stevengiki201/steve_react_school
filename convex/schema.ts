import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * MarketHub Database Schema
 *
 * Tables:
 * - users: Platform users (customers, sellers, admins)
 * - sellerProfiles: Business profiles for sellers
 * - categories: Product categories
 * - products: Listed products
 * - productImages: Product images (up to 6 per product)
 * - carts: Shopping carts (one per user)
 * - cartItems: Items in a cart
 * - orders: Customer orders
 * - orderItems: Line items in an order
 * - payments: Payment records
 * - advertisementCampaigns: Ad campaigns by sellers
 * - advertisementEvents: Tracking events (impressions, clicks, etc.)
 */
export default defineSchema({
  // ==========================================
  // USERS
  // ==========================================
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("seller"),
      v.literal("admin"),
    ),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.boolean(),
    // Convex Auth links to the auth system
    authId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_authId", ["authId"]),

  // ==========================================
  // SELLER PROFILES
  // ==========================================
  sellerProfiles: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    businessDescription: v.optional(v.string()),
    logo: v.optional(v.string()),
    location: v.string(),
    isVerified: v.boolean(),
    rating: v.number(),
    totalSales: v.number(),
    totalOrders: v.number(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_isActive", ["isActive"]),

  // ==========================================
  // CATEGORIES
  // ==========================================
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentCategoryId: v.optional(v.id("categories")),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  // ==========================================
  // PRODUCTS
  // ==========================================
  products: defineTable({
    sellerId: v.id("sellerProfiles"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    categoryId: v.id("categories"),
    stockQuantity: v.number(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    averageRating: v.number(),
    totalReviews: v.number(),
    totalSales: v.number(),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_seller", ["sellerId"])
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"])
    .index("by_isActive", ["isActive"])
    .index("by_isFeatured", ["isFeatured"]),

  // ==========================================
  // PRODUCT IMAGES
  // ==========================================
  productImages: defineTable({
    productId: v.id("products"),
    url: v.string(),
    alt: v.optional(v.string()),
    sortOrder: v.number(),
    isPrimary: v.boolean(),
  })
    .index("by_product", ["productId"]),

  // ==========================================
  // CARTS
  // ==========================================
  carts: defineTable({
    userId: v.id("users"),
  })
    .index("by_user", ["userId"]),

  // ==========================================
  // CART ITEMS
  // ==========================================
  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
    addedAt: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_cart_product", ["cartId", "productId"]),

  // ==========================================
  // ORDERS
  // ==========================================
  orders: defineTable({
    orderNumber: v.string(),
    customerId: v.id("users"),
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
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    currency: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryAddress: v.string(),
    deliveryLocation: v.optional(v.string()),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_orderNumber", ["orderNumber"]),

  // ==========================================
  // ORDER ITEMS
  // ==========================================
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    sellerId: v.id("sellerProfiles"),
    productName: v.string(),
    productImage: v.optional(v.string()),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    currency: v.string(),
  })
    .index("by_order", ["orderId"])
    .index("by_seller", ["sellerId"]),

  // ==========================================
  // PAYMENTS
  // ==========================================
  payments: defineTable({
    orderId: v.id("orders"),
    amount: v.number(),
    currency: v.string(),
    method: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    transactionId: v.optional(v.string()),
    providerReference: v.optional(v.string()),
  })
    .index("by_order", ["orderId"]),

  // ==========================================
  // ADVERTISEMENT CAMPAIGNS
  // ==========================================
  advertisementCampaigns: defineTable({
    sellerId: v.id("sellerProfiles"),
    productId: v.id("products"),
    name: v.string(),
    budget: v.number(),
    spent: v.number(),
    currency: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    targetLocation: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
  })
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"]),

  // ==========================================
  // ADVERTISEMENT EVENTS
  // ==========================================
  advertisementEvents: defineTable({
    campaignId: v.id("advertisementCampaigns"),
    eventType: v.union(
      v.literal("impression"),
      v.literal("click"),
      v.literal("add_to_cart"),
      v.literal("purchase"),
    ),
    productId: v.id("products"),
    metadata: v.optional(v.any()),
  })
    .index("by_campaign", ["campaignId"]),
});
