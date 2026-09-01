import { ReactNode } from "react";
import BottomNav from "@/components/nav/BottomNav";

interface CustomerLayoutProps {
  children: ReactNode;
}

/**
 * Customer layout wraps all customer-facing pages.
 * Includes the bottom navigation bar and proper spacing.
 */
export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
