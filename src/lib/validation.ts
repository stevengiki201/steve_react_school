import { z } from "zod";

/**
 * MarketHub Validation Schemas
 *
 * Zod schemas used for client-side form validation.
 * Server-side validation is always the source of truth.
 */

// ==========================================
// AUTH
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["customer", "seller"]),
});

// ==========================================
// USER PROFILE
// ==========================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(9, "Phone number must be at least 9 digits").optional(),
  location: z.string().optional(),
  avatar: z.string().url("Invalid URL").optional(),
});

// ==========================================
// SELLER
// ==========================================

export const createSellerProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessDescription: z.string().optional(),
  logo: z.string().url("Invalid URL").optional(),
  location: z.string().min(2, "Location is required"),
});

// ==========================================
// PRODUCTS
// ==========================================

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(200, "Name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description too long"),
  price: z.number().min(1, "Price must be at least 1 TZS").max(100000000, "Price too high"),
  categoryId: z.string().min(1, "Category is required"),
  stockQuantity: z.number().min(0, "Stock cannot be negative").int("Stock must be a whole number"),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().min(1).max(100000000).optional(),
  categoryId: z.string().min(1).optional(),
  stockQuantity: z.number().min(0).int().optional(),
  isActive: z.boolean().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ==========================================
// CART
// ==========================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").int().max(99, "Maximum quantity is 99"),
});

// ==========================================
// ORDERS / CHECKOUT
// ==========================================

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z
    .string()
    .min(9, "Phone number is required")
    .regex(/^[\d\s\+\-]+$/, "Invalid phone number format"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryLocation: z.string().optional(),
  paymentMethod: z.enum(["mobile_money", "cash_on_delivery", "card"], {
    errorMap: () => ({ message: "Select a payment method" }),
  }),
  notes: z.string().max(500, "Notes too long").optional(),
});

// ==========================================
// ADDRESSES
// ==========================================

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Work)"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(9, "Phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  region: z.string().optional(),
  isDefault: z.boolean(),
});

// ==========================================
// ADVERTISING
// ==========================================

export const createCampaignSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(2, "Campaign name is required").max(100, "Name too long"),
  budget: z.number().min(1000, "Minimum budget is TSh 1,000").max(10000000, "Budget too high"),
  startDate: z.date(),
  endDate: z.date(),
  targetLocation: z.string().optional(),
  targetCategory: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// ==========================================
// SEARCH / FILTERS
// ==========================================

export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(["newest", "price_low", "price_high", "popular"]).optional(),
});

// ==========================================
// TYPES
// ==========================================

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type CreateSellerProfileValues = z.infer<typeof createSellerProfileSchema>;
export type CreateProductValues = z.infer<typeof createProductSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;
export type AddToCartValues = z.infer<typeof addToCartSchema>;
export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type CreateCampaignValues = z.infer<typeof createCampaignSchema>;
export type SearchValues = z.infer<typeof searchSchema>;
