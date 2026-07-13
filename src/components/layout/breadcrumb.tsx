"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  costing: "Order Costing",
  customers: "Customers",
  suppliers: "Suppliers",
  yarn: "Yarn",
  planning: "Planning",
  procurement: "Procurement",
  inventory: "Inventory",
  production: "Production",
  "grey-fabric": "Grey Fabric",
  knitting: "Knitting",
  dyeing: "Dyeing",
  printing: "Printing",
  compacting: "Compacting",
  checking: "Checking / QC",
  cutting: "Cutting",
  stitching: "Stitching",
  packing: "Packing",
  dispatch: "Dispatch",
  finance: "Finance",
  invoices: "Invoices",
  payments: "Payments",
  gst: "GST",
  purchase: "Purchase",
  reports: "Reports",
  settings: "Settings",
  company: "Company",
  users: "Users",
  roles: "Roles",
  "yarn-types": "Yarn Types",
  new: "New",
  edit: "Edit",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center text-[#6B7280] hover:text-[#374151] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-[#D1D5DB]" />
          {crumb.isLast ? (
            <span className={cn("font-medium text-[#111827]")}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[#6B7280] hover:text-[#374151] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
