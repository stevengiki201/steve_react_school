/**
 * MarketHub Shared Types
 *
 * Central type definitions used across the application.
 * Types here mirror the Convex schema but are used for
 * frontend type safety and API contracts.
 */

// ==========================================
// ROLES & AUTH
// ==========================================

export type UserRole = "customer" | "seller" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SellerProfile {
  _id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  logo?: string;
  location: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// PRODUCTS
// ==========================================

export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  location?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProductImage {
  _id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: number;
}

export interface ProductWithDetails extends Product {
  images: ProductImage[];
  seller: { businessName: string; isVerified: boolean } | null;
}

// ==========================================
// CATEGORIES
// ==========================================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
}

// ==========================================
// CART
// ==========================================

export interface CartItem {
  _id: string;
  cartId: string;
  productId: string;
  quantity: number;
  addedAt: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// ORDERS
// ==========================================

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "processing"
  | "ready_for_delivery"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLocation?: string;
  paymentMethod: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  createdAt: number;
}

// ==========================================
// PAYMENTS
// ==========================================

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  providerReference?: string;
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// ADVERTISING
// ==========================================

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type AdEventType =
  | "impression"
  | "click"
  | "add_to_cart"
  | "purchase";

export interface AdvertisementCampaign {
  _id: string;
  sellerId: string;
  productId: string;
  name: string;
  budget: number;
  spent: number;
  currency: string;
  startDate: number;
  endDate: number;
  status: CampaignStatus;
  targetLocation?: string;
  targetCategory?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignAnalytics {
  campaign: AdvertisementCampaign;
  impressions: number;
  clicks: number;
  addToCarts: number;
  purchaseCount: number;
  totalRevenue: number;
  spend: number;
  conversionRate: number;
}

// ==========================================
// ADDRESSES
// ==========================================

export interface Address {
  _id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  isDefault: boolean;
  createdAt: number;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
