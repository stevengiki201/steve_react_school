import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { MARKETHUB, ROUTES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={ROUTES.home} className="flex items-center gap-2 mb-3">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">
                {MARKETHUB.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {MARKETHUB.description}
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.market}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  to="/category/electronics"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/category/fashion"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/category/home"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Home & Garden
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">
              For Sellers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.auth}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Start Selling
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.sellerDashboard}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Advertising
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">
              Trust & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  Verified Sellers
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Buyer Protection
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {MARKETHUB.name}. All rights
            reserved. Made in Tanzania.
          </p>
        </div>
      </div>
    </footer>
  );
}
