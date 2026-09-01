/**
 * MarketHub Constants
 */

// ==========================================
// CURRENCY
// ==========================================

export const CURRENCY = "TZS";
export const CURRENCY_SYMBOL = "TSh";

/**
 * Format a price in TZS.
 * Example: formatPrice(1200000) => "TSh 1,200,000"
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString("en-TZ")}`;
}

// ==========================================
// ORDER STATUS
// ==========================================

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  processing: "bg-purple-100 text-purple-800",
  ready_for_delivery: "bg-cyan-100 text-cyan-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

// ==========================================
// CAMPAIGN STATUS
// ==========================================

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ==========================================
// PAYMENT METHODS
// ==========================================

export const PAYMENT_METHODS = [
  { value: "mobile_money", label: "Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "card", label: "Credit/Debit Card" },
] as const;

// ==========================================
// ROLES
// ==========================================

export const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  seller: "Seller",
  admin: "Admin",
};

// ==========================================
// PAGINATION
// ==========================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ==========================================
// PRODUCT
// ==========================================

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ==========================================
// MARKETHUB THEME
// ==========================================

export const MARKETHUB = {
  name: "MarketHub",
  tagline: "Discover. Buy. Trust.",
  description: "Marketplace and advertising platform for Tanzania",
  colors: {
    primary: "#E85D04",    // Warm orange — energy, commerce
    secondary: "#1B4332",  // Deep green — trust, Tanzania flag
    accent: "#F4A261",     // Light amber — warmth
    background: "#FAFAF5", // Warm off-white
    text: "#1A1A2E",       // Near-black blue
  },
} as const;

// ==========================================
// ROUTES
// ==========================================

export const ROUTES = {
  home: "/",
  market: "/market",
  product: (slug: string) => `/product/${slug}`,
  category: (slug: string) => `/category/${slug}`,
  store: (slug: string) => `/store/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  order: (id: string) => `/orders/${id}`,
  auth: "/auth",
  profile: "/profile",
  addresses: "/addresses",

  // Seller
  sellerDashboard: "/seller/dashboard",
  sellerProducts: "/seller/products",
  sellerProductNew: "/seller/products/new",
  sellerProductEdit: (id: string) => `/seller/products/${id}/edit`,
  sellerOrders: "/seller/orders",
  sellerCampaigns: "/seller/campaigns",
  sellerCampaignNew: "/seller/campaigns/new",
  sellerAnalytics: "/seller/analytics",
  sellerSettings: "/seller/settings",
  sellerProfile: "/seller/profile",

  // Admin
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminSellers: "/admin/sellers",
  adminProducts: "/admin/products",
  adminOrders: "/admin/orders",
  adminPayments: "/admin/payments",
  adminCategories: "/admin/categories",
  adminCampaigns: "/admin/campaigns",
  adminReports: "/admin/reports",
  adminSettings: "/admin/settings",
} as const;
