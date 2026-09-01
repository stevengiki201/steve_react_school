# MarketHub Architecture

## Overview

MarketHub uses a serverless architecture powered by Convex, providing real-time capabilities with a simplified deployment model.

## Architecture Decisions

### 1. Convex as Database + Backend

**Decision**: Use Convex instead of PostgreSQL + Prisma.

**Rationale**:
- Convex provides real-time reactive queries out of the box
- No separate backend server to manage
- Automatic code generation for types
- Built-in auth integration
- Scales without infrastructure management

**Trade-offs**:
- Less control over database queries vs raw SQL
- Vendor dependency on Convex
- Limited to Convex's query capabilities for complex joins

### 2. Server-Authoritative Pricing

**Decision**: All price calculations happen on the server (Convex mutations).

**Rationale**: Prevents client-side price manipulation. Cart totals, order totals, and ad spend are always computed server-side.

### 3. Role-Based Access Control

**Decision**: Three roles (customer, seller, admin) with server-side enforcement.

**Implementation**:
- Every Convex function checks `getAuthUserId()` first
- Seller functions verify `seller.userId === authUserId`
- Admin functions verify `user.role === "admin"`
- Client-side route guards prevent unauthorized navigation (defense in depth)

### 4. Soft Deletion

**Decision**: Products and campaigns use `isActive` flags instead of hard deletes.

**Rationale**: Preserves historical data (orders, analytics) that references deleted entities.

### 5. Order State Machine

**Decision**: Strict state transitions for orders.

```
PENDING_PAYMENT → PAID → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                     ↘ CANCELLED
                       ↘ REFUNDED (from PAID or DELIVERED)
```

Invalid transitions are rejected server-side.

### 6. Advertising Attribution

**Decision**: Track impressions, clicks, add-to-cart, and purchase events per campaign.

**Rationale**: This is MarketHub's core differentiator — connecting advertising spend to actual sales.

## Database Schema

See `src/convex/schema.ts` for the complete schema.

### Key Relationships

```
User
├── SellerProfile (1:1)
├── Address (1:N)
└── Cart → CartItem (1:N → N:1 Product)

SellerProfile
└── Product (1:N)

Product
├── ProductImage (1:N)
├── AdvertisementCampaign (1:N)
└── Review (1:N)

Order
├── OrderItem (1:N)
└── Payment (1:1)

AdvertisementCampaign
└── AdvertisementEvent (1:N)
```

## Security Model

1. **Authentication**: Convex Auth with OAuth providers
2. **Authorization**: Server-side role checks in every function
3. **Input Validation**: Zod schemas on client, manual validation in Convex functions
4. **Price Security**: All calculations server-side
5. **Order Security**: State transitions validated against allowed transitions
6. **Data Isolation**: Sellers can only access their own products/orders

## Mobile-First Design

- All layouts tested at 360px, 390px, 412px widths
- Touch-friendly tap targets (minimum 44px)
- Simplified navigation on small screens
- Progressive disclosure for complex forms
- Minimal animations for performance

## Performance Considerations

- Convex handles caching and real-time updates
- Images should be optimized (future: Convex file storage or CDN)
- Pagination implemented for all list queries
- Lazy loading for images
- No unnecessary re-renders (Convex query deduplication)

## Testing Strategy

- **Unit tests**: Zod validation schemas
- **Integration tests**: Convex functions (using `convex testing`)
- **E2E tests**: Critical purchase journey (planned)
- **Manual testing**: Mobile responsiveness at target widths

## Deployment

- **Frontend**: Static build via Vite, hosted on Freebuff/Cloudflare
- **Backend**: Convex cloud (auto-deployed with `bunx convex dev`)
- **No separate server infrastructure required**
