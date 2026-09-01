import { ReactNode } from "react";
import AdminNav from "@/components/nav/AdminNav";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin layout wraps all admin pages.
 * Sidebar on desktop, drawer + top bar on mobile.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="lg:ml-64 pt-12 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
