# MarketHub

**Discover. Buy. Trust.**

MarketHub is a marketplace and advertising platform designed for Tanzania. Businesses advertise → customers discover → customers buy → sellers fulfill → MarketHub earns revenue.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Convex (real-time database + functions)
- **Auth**: Convex Auth (GitHub + Google OAuth)
- **State Management**: Convex reactive queries
- **Validation**: Zod
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom theme tokens

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Convex](https://convex.dev/) account (for backend/database)

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up Convex:
   ```bash
   bunx convex dev
   ```
   This will prompt you to create/connect a Convex project.

3. Start the dev server:
   ```bash
   bun dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | Convex deployment URL (auto-set by `bunx convex dev`) |

### Production

```bash
bun run build
```

The build output is in `dist/`.

## Project Structure

```
src/
├── components/
│   ├── auth/           # Auth guard components
│   ├── layout/         # Navbar, Footer, Layout
│   └── ui/             # shadcn/ui components
├── convex/             # Convex backend functions & schema
├── hooks/              # Custom React hooks
├── lib/                # Types, validation, constants, utilities
├── pages/
│   ├── seller/         # Seller dashboard pages
│   ├── admin/          # Admin dashboard pages
│   └── *.tsx           # Public & customer pages
├── App.tsx             # Routing configuration
└── main.tsx            # Application entry point
```

## User Roles

- **Customer**: Browse, search, buy products, track orders
- **Seller**: Manage products, process orders, create ad campaigns
- **Admin**: Platform oversight, user/seller management, analytics

## Key Features

- Mobile-first responsive design
- Real-time product listings
- Shopping cart with server-authoritative pricing
- Order lifecycle management (9 states)
- Advertising campaign system with event tracking
- Role-based access control
- Seller verification system

## License

Proprietary — All rights reserved.
