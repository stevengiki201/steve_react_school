import { ReactNode } from "react";
import SellerNav from "@/components/nav/SellerNav";

interface SellerLayoutProps {
  children: ReactNode;
}

/**
 * Seller layout wraps all seller dashboard pages.
 * Sidebar on desktop, bottom tabs on mobile.
 */
export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SellerNav />
      <main className="lg:ml-64 pt-0 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="lg:hidden h-12" /> {/* Spacer for mobile top bar */}
        {children}
      </main>
    </div>
  );
}
