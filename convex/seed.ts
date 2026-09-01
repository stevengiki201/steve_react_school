import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with comprehensive sample data for MarketHub.
 *
 * Creates: categories, admin user, sellers, products with images,
 * sample orders, and ad campaigns.
 *
 * Run once via Convex dashboard or the admin UI seed button.
 * Safe to re-run — skips if data already exists.
 */

// ==========================================
// CATEGORIES
// ==========================================

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) {
      return { message: "Categories already seeded", count: existing.length };
    }

    const categories = [
      { name: "Electronics", slug: "electronics", description: "Phones, laptops, gadgets, and tech", icon: "📱", sortOrder: 1 },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories", icon: "👗", sortOrder: 2 },
      { name: "Beauty & Health", slug: "beauty-health", description: "Skincare, cosmetics, and wellness", icon: "💄", sortOrder: 3 },
      { name: "Food & Groceries", slug: "food-groceries", description: "Fresh food, snacks, and beverages", icon: "🍎", sortOrder: 4 },
      { name: "Home & Garden", slug: "home-garden", description: "Furniture, decor, and tools", icon: "🏠", sortOrder: 5 },
      { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Fitness gear and outdoor equipment", icon: "⚽", sortOrder: 6 },
      { name: "Baby & Kids", slug: "baby-kids", description: "Toys, clothing, and baby care", icon: "🧸", sortOrder: 7 },
      { name: "Automotive", slug: "automotive", description: "Car parts, accessories, and tools", icon: "🚗", sortOrder: 8 },
      { name: "Books & Stationery", slug: "books-stationery", description: "Books, school supplies, and office", icon: "📚", sortOrder: 9 },
      { name: "Services", slug: "services", description: "Professional and local services", icon: "🔧", sortOrder: 10 },
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

// ==========================================
// FULL DEMO SEED
// ==========================================

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Seed categories first
    const existingCats = await ctx.db.query("categories").collect();
    if (existingCats.length === 0) {
      const categories = [
        { name: "Electronics", slug: "electronics", description: "Phones, laptops, gadgets, and tech", icon: "📱", sortOrder: 1 },
        { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories", icon: "👗", sortOrder: 2 },
        { name: "Beauty & Health", slug: "beauty-health", description: "Skincare, cosmetics, and wellness", icon: "💄", sortOrder: 3 },
        { name: "Food & Groceries", slug: "food-groceries", description: "Fresh food, snacks, and beverages", icon: "🍎", sortOrder: 4 },
        { name: "Home & Garden", slug: "home-garden", description: "Furniture, decor, and tools", icon: "🏠", sortOrder: 5 },
        { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Fitness gear and outdoor equipment", icon: "⚽", sortOrder: 6 },
        { name: "Baby & Kids", slug: "baby-kids", description: "Toys, clothing, and baby care", icon: "🧸", sortOrder: 7 },
        { name: "Automotive", slug: "automotive", description: "Car parts, accessories, and tools", icon: "🚗", sortOrder: 8 },
        { name: "Books & Stationery", slug: "books-stationery", description: "Books, school supplies, and office", icon: "📚", sortOrder: 9 },
        { name: "Services", slug: "services", description: "Professional and local services", icon: "🔧", sortOrder: 10 },
      ];
      for (const cat of categories) {
        await ctx.db.insert("categories", { ...cat, isActive: true });
      }
    }
    const allCats = await ctx.db.query("categories").collect();
    const catMap: Record<string, any> = {};
    for (const c of allCats) catMap[c.slug] = c;

    // 2. Check if sellers already exist
    const existingSellers = await ctx.db.query("sellerProfiles").collect();
    if (existingSellers.length > 0) {
      return { message: "Demo data already seeded", sellers: existingSellers.length };
    }

    // 3. Create admin user
    await ctx.db.insert("users", {
      name: "Admin",
      email: "admin@markethub.tz",
      role: "admin",
      phone: "+255 700 000 000",
      location: "Dar es Salaam",
      isActive: true,
    });

    // 4. Create seller users + profiles
    const sellerData = [
      {
        userName: "Amani Fashion House",
        email: "amani@fashion.tz",
        businessName: "Amani Fashion House",
        businessDescription: "Premium Tanzanian fashion — handcrafted clothing, shoes, and accessories for men and women.",
        location: "Dar es Salaam",
      },
      {
        userName: "TechHub Tanzania",
        email: "tech@hub.tz",
        businessName: "TechHub Tanzania",
        businessDescription: "Your one-stop shop for phones, laptops, and gadgets. Authorized dealer.",
        location: "Dar es Salaam",
      },
      {
        userName: "Mama Ntilie Kitchen",
        email: "mama@ntilie.tz",
        businessName: "Mama Ntilie Kitchen",
        businessDescription: "Authentic Tanzanian food — fresh chapati, pilau mixes, snacks, and spices.",
        location: "Arusha",
      },
      {
        userName: "SportZone TZ",
        email: "sport@zone.tz",
        businessName: "SportZone TZ",
        businessDescription: "Sports equipment, jerseys, and fitness gear for athletes and enthusiasts.",
        location: "Mbeya",
      },
      {
        userName: "HomeStyle Dar",
        email: "home@style.tz",
        businessName: "HomeStyle Dar",
        businessDescription: "Furniture, home décor, and garden essentials — designed for modern Tanzanian homes.",
        location: "Dar es Salaam",
      },
    ];

    const sellerIds: any[] = [];
    for (const s of sellerData) {
      const userId = await ctx.db.insert("users", {
        name: s.userName,
        email: s.email,
        role: "seller",
        location: s.location,
        isActive: true,
      });
      const profileId = await ctx.db.insert("sellerProfiles", {
        userId,
        businessName: s.businessName,
        businessDescription: s.businessDescription,
        location: s.location,
        isVerified: true,
        rating: 4.5,
        totalSales: 0,
        totalOrders: 0,
        isActive: true,
      });
      sellerIds.push(profileId);
    }

    // 5. Create sample products
    const sampleProducts = [
      // --- Fashion (seller 0) ---
      {
        sellerIdx: 0, catSlug: "fashion", name: "Premium Kanga Dress",
        description: "Beautifully handcrafted kanganga dress made from authentic Tanzanian fabric. Perfect for weddings, celebrations, or everyday elegance. Available in multiple vibrant patterns.",
        price: 85000, stock: 25, featured: true,
        images: ["https://picsum.photos/seed/kanga1/600/600", "https://picsum.photos/seed/kanga2/600/600"],
        tags: ["kanga", "dress", "women", "handcrafted"],
      },
      {
        sellerIdx: 0, catSlug: "fashion", name: "Men's Dashiki Shirt",
        description: "Traditional dashiki shirt with modern styling. 100% cotton, comfortable fit, perfect for cultural events or casual outings.",
        price: 45000, stock: 40, featured: true,
        images: ["https://picsum.photos/seed/dashiki1/600/600"],
        tags: ["dashiki", "men", "shirt", "traditional"],
      },
      {
        sellerIdx: 0, catSlug: "fashion", name: "Handmade Leather Sandals",
        description: "Genuine leather sandals handcrafted by local artisans. Durable, comfortable, and stylish for everyday wear.",
        price: 35000, stock: 30, featured: false,
        images: ["https://picsum.photos/seed/sandals1/600/600"],
        tags: ["sandals", "leather", "handmade", "shoes"],
      },
      {
        sellerIdx: 0, catSlug: "fashion", name: "Kitenge Skirt Set",
        description: "Matching kitenge skirt and top set. Vibrant African print, flared skirt, fitted top. Great for parties and cultural events.",
        price: 65000, stock: 20, featured: true,
        images: ["https://picsum.photos/seed/kitenge1/600/600", "https://picsum.photos/seed/kitenge2/600/600"],
        tags: ["kitenge", "skirt", "set", "women"],
      },

      // --- Electronics (seller 1) ---
      {
        sellerIdx: 1, catSlug: "electronics", name: "Samsung Galaxy A15",
        description: "Samsung Galaxy A15 128GB. 50MP triple camera, 6.5\" AMOLED display, 5000mAh battery. Brand new with warranty.",
        price: 450000, stock: 15, featured: true,
        images: ["https://picsum.photos/seed/samsung1/600/600", "https://picsum.photos/seed/samsung2/600/600"],
        tags: ["samsung", "phone", "galaxy", "android"],
      },
      {
        sellerIdx: 1, catSlug: "electronics", name: "JBL Tune 510BT Headphones",
        description: "Wireless on-ear headphones with 40-hour battery, JBL Pure Bass sound, and foldable design. Bluetooth 5.0.",
        price: 75000, stock: 30, featured: false,
        images: ["https://picsum.photos/seed/jbl1/600/600"],
        tags: ["headphones", "jbl", "wireless", "audio"],
      },
      {
        sellerIdx: 1, catSlug: "electronics", name: "Anker PowerBank 20000mAh",
        description: "High-capacity power bank with dual USB ports, fast charging support, and LED indicator. Charges phones 4-5 times.",
        price: 55000, stock: 25, featured: false,
        images: ["https://picsum.photos/seed/anker1/600/600"],
        tags: ["powerbank", "charger", "anker", "portable"],
      },
      {
        sellerIdx: 1, catSlug: "electronics", name: "Xiaomi Redmi Buds 5",
        description: "True wireless earbuds with active noise cancellation, 30-hour total battery, and IP54 water resistance.",
        price: 65000, stock: 20, featured: true,
        images: ["https://picsum.photos/seed/buds1/600/600"],
        tags: ["earbuds", "xiaomi", "wireless", "anc"],
      },

      // --- Food (seller 2) ---
      {
        sellerIdx: 2, catSlug: "food-groceries", name: "Tanzanian Pilau Spice Mix",
        description: "Authentic pilau spice blend — cardamom, cinnamon, cloves, and cumin. Makes enough for 8-10 servings. Family recipe from Arusha.",
        price: 8000, stock: 50, featured: true,
        images: ["https://picsum.photos/seed/pilau1/600/600"],
        tags: ["pilau", "spice", "cooking", "tanzanian"],
      },
      {
        sellerIdx: 2, catSlug: "food-groceries", name: "Fresh Honey (1kg)",
        description: "Pure, unfiltered honey from the slopes of Mount Kilimanjaro. Raw and natural — no additives. Perfect for tea, cooking, or health.",
        price: 25000, stock: 30, featured: true,
        images: ["https://picsum.photos/seed/honey1/600/600"],
        tags: ["honey", "organic", "natural", "kilimanjaro"],
      },
      {
        sellerIdx: 2, catSlug: "food-groceries", name: "Cashew Nuts (500g)",
        description: "Premium roasted cashew nuts from Tanzania. Lightly salted, crunchy, and packed with flavor. Gift-ready packaging.",
        price: 30000, stock: 40, featured: false,
        images: ["https://picsum.photos/seed/cashew1/600/600"],
        tags: ["cashew", "nuts", "snack", "roasted"],
      },

      // --- Sports (seller 3) ---
      {
        sellerIdx: 3, catSlug: "sports-outdoors", name: "Training Football (Size 5)",
        description: "Professional-grade training football. Durable PU leather, FIFA-approved size 5. Suitable for all surfaces.",
        price: 28000, stock: 35, featured: true,
        images: ["https://picsum.photos/seed/football1/600/600"],
        tags: ["football", "soccer", "training", "sports"],
      },
      {
        sellerIdx: 3, catSlug: "sports-outdoors", name: "Running Shoes - Air Max",
        description: "Lightweight running shoes with cushioned sole and breathable mesh upper. Available in sizes 39-46.",
        price: 55000, stock: 20, featured: true,
        images: ["https://picsum.photos/seed/running1/600/600", "https://picsum.photos/seed/running2/600/600"],
        tags: ["running", "shoes", "sports", "fitness"],
      },
      {
        sellerIdx: 3, catSlug: "sports-outdoors", name: "Yoga Mat (6mm)",
        description: "Non-slip exercise yoga mat. 6mm thick, 183cm x 61cm. Comes with carrying strap. Perfect for home workouts.",
        price: 22000, stock: 25, featured: false,
        images: ["https://picsum.photos/seed/yoga1/600/600"],
        tags: ["yoga", "mat", "exercise", "fitness"],
      },

      // --- Home (seller 4) ---
      {
        sellerIdx: 4, catSlug: "home-garden", name: "Handwoven Basket Set",
        description: "Set of 3 handwoven storage baskets in traditional Tanzanian patterns. S/M/L sizes. Perfect for organization and decoration.",
        price: 45000, stock: 15, featured: true,
        images: ["https://picsum.photos/seed/basket1/600/600"],
        tags: ["basket", "handwoven", "storage", "decor"],
      },
      {
        sellerIdx: 4, catSlug: "home-garden", name: "Decorative Cushion Covers (4pc)",
        description: "Set of 4 African print cushion covers. 45x45cm, hidden zipper, machine washable. Vibrant kanga-inspired designs.",
        price: 35000, stock: 20, featured: false,
        images: ["https://picsum.photos/seed/cushion1/600/600"],
        tags: ["cushion", "covers", "african", "decor"],
      },
      {
        sellerIdx: 4, catSlug: "home-garden", name: "Ceramic Dinnerware Set",
        description: "12-piece ceramic dinnerware set — 4 plates, 4 bowls, 4 mugs. Modern design in earth tones. Dishwasher safe.",
        price: 95000, stock: 10, featured: true,
        images: ["https://picsum.photos/seed/dinner1/600/600", "https://picsum.photos/seed/dinner2/600/600"],
        tags: ["dinnerware", "ceramic", "plates", "kitchen"],
      },
      {
        sellerIdx: 4, catSlug: "home-garden", name: "Potted Indoor Plant",
        description: "Low-maintenance indoor plant in decorative clay pot. Improves air quality and adds greenery to any room.",
        price: 18000, stock: 12, featured: false,
        images: ["https://picsum.photos/seed/plant1/600/600"],
        tags: ["plant", "indoor", "garden", "decor"],
      },
    ];

    const productIds: any[] = [];
    for (const p of sampleProducts) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const productId = await ctx.db.insert("products", {
        sellerId: sellerIds[p.sellerIdx],
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        currency: "TZS",
        categoryId: catMap[p.catSlug]._id,
        stockQuantity: p.stock,
        isActive: true,
        isFeatured: p.featured,
        averageRating: +(3.5 + Math.random() * 1.5).toFixed(1),
        totalReviews: Math.floor(Math.random() * 50),
        totalSales: 0,
        location: sellerData[p.sellerIdx].location,
        tags: p.tags,
      });
      productIds.push(productId);

      // Add product images
      for (let i = 0; i < p.images.length; i++) {
        await ctx.db.insert("productImages", {
          productId,
          url: p.images[i],
          alt: `${p.name} - image ${i + 1}`,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    // 6. Create a sample order (to demo order tracking)
    const customerUserId = await ctx.db.insert("users", {
      name: "John Mwasalabi",
      email: "john@demo.tz",
      role: "customer",
      phone: "+255 712 345 678",
      location: "Dar es Salaam",
      isActive: true,
    });

    const orderNumber = `MH${Date.now().toString().slice(-6)}`;
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      customerId: customerUserId,
      status: "paid",
      subtotal: 450000,
      deliveryFee: 5000,
      total: 455000,
      currency: "TZS",
      customerName: "John Mwasalabi",
      customerPhone: "+255 712 345 678",
      deliveryAddress: "123 Main Road, Kariakoo, Dar es Salaam",
      deliveryLocation: "Near Kariakoo Market",
      paymentMethod: "mobile_money",
      notes: "Please call before delivery",
    });

    // Order item for the Samsung phone
    await ctx.db.insert("orderItems", {
      orderId,
      productId: productIds[4], // Samsung Galaxy A15
      sellerId: sellerIds[1],
      productName: "Samsung Galaxy A15",
      quantity: 1,
      unitPrice: 450000,
      totalPrice: 450000,
      currency: "TZS",
    });

    // Sample payment
    await ctx.db.insert("payments", {
      orderId,
      amount: 455000,
      currency: "TZS",
      method: "mobile_money",
      status: "completed",
      transactionId: `TXN${Date.now()}`,
    });

    // Update seller stats
    const seller1Profile = await ctx.db.get(sellerIds[1]) as any;
    if (seller1Profile) {
      await ctx.db.patch(sellerIds[1], {
        totalSales: (seller1Profile.totalSales ?? 0) + 450000,
        totalOrders: (seller1Profile.totalOrders ?? 0) + 1,
      });
    }

    // 7. Create a sample ad campaign
    const now = Date.now();
    const campaignId = await ctx.db.insert("advertisementCampaigns", {
      sellerId: sellerIds[1], // TechHub
      productId: productIds[4], // Samsung
      name: "Samsung Galaxy Launch Campaign",
      budget: 100000,
      spent: 23500,
      currency: "TZS",
      startDate: now - 7 * 24 * 60 * 60 * 1000, // started 7 days ago
      endDate: now + 7 * 24 * 60 * 60 * 1000, // ends in 7 days
      status: "active",
      targetLocation: "Dar es Salaam",
      targetCategory: "Electronics",
    });

    // Sample ad events
    for (let i = 0; i < 120; i++) {
      await ctx.db.insert("advertisementEvents", {
        campaignId,
        eventType: "impression",
        productId: productIds[4],
      });
    }
    for (let i = 0; i < 35; i++) {
      await ctx.db.insert("advertisementEvents", {
        campaignId,
        eventType: "click",
        productId: productIds[4],
      });
    }
    for (let i = 0; i < 3; i++) {
      await ctx.db.insert("advertisementEvents", {
        campaignId,
        eventType: "purchase",
        productId: productIds[4],
      });
    }

    return {
      message: "Full demo data seeded successfully!",
      summary: {
        categories: allCats.length,
        sellers: sellerData.length,
        products: sampleProducts.length,
        orders: 1,
        campaigns: 1,
      },
    };
  },
});

// ==========================================
// RESET (for dev only — clears everything)
// ==========================================

export const resetAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all data
    for (const table of [
      "advertisementEvents",
      "advertisementCampaigns",
      "payments",
      "orderItems",
      "orders",
      "cartItems",
      "carts",
      "productImages",
      "products",
      "categories",
      "sellerProfiles",
      "users",
    ]) {
      const all = await ctx.db.query(table as any).collect();
      for (const doc of all) {
        await ctx.db.delete(doc._id);
      }
    }
    return { message: "All data reset" };
  },
});
