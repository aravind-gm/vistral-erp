"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Factory,
  FileText,
  BarChart3,
  Settings,
  Warehouse,
  Shirt,
  Truck,
  DollarSign,
  ChevronDown,
  Building2,
  UserCheck,
  ClipboardList,
  Layers,
  Scissors,
  BoxSelect,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    children: [
      { title: "All Orders", href: "/orders", icon: ClipboardList },
      { title: "Order Costing", href: "/orders/costing", icon: DollarSign },
    ],
  },
  {
    title: "Yarn Procurement",
    href: "/yarn/procurement",
    icon: Package,
  },
  {
    title: "Yarn Types",
    href: "/settings/yarn-types",
    icon: Layers,
  },
  {
    title: "Production",
    icon: Factory,
    children: [
      { title: "Knitting", href: "/production/knitting", icon: Factory },
      { title: "Grey Fabric", href: "/production/grey-fabric", icon: Layers },
      { title: "Dyeing", href: "/production/dyeing", icon: Factory },
      { title: "Heatsetting", href: "/production/heatsetting", icon: Factory },
      { title: "Centering", href: "/production/centering", icon: Factory },
      { title: "Printing", href: "/production/printing", icon: Factory },
      { title: "Compacting", href: "/production/compacting", icon: Factory },
      { title: "Bio Wash", href: "/production/bio-wash", icon: Factory },
      { title: "Checking / QC", href: "/production/checking", icon: UserCheck },
      { title: "Cutting", href: "/production/cutting", icon: Scissors },
      { title: "Stitching", href: "/production/stitching", icon: Factory },
      { title: "Packing", href: "/production/packing", icon: BoxSelect },
      { title: "Dispatch", href: "/production/dispatch", icon: Truck },
    ],
  },
  {
    title: "Purchase",
    icon: Package,
    children: [
      { title: "Purchase Orders", href: "/purchase", icon: ClipboardList },
      { title: "Suppliers", href: "/suppliers", icon: Building2 },
    ],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Company", href: "/settings/company", icon: Building2 },
      { title: "Users", href: "/settings/users", icon: Users },
      { title: "Roles", href: "/settings/roles", icon: UserCheck },
    ],
  },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(() => {
    if (!item.children) return false;
    return item.children.some((child) => child.href === pathname || pathname.startsWith(child.href ?? "____"));
  });

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            open
              ? "bg-[#F3F4F6] text-[#111827]"
              : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform text-[#9CA3AF]",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-[#E5E7EB] pl-3">
            {item.children.map((child) => (
              <NavItemComponent key={child.title} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#111827] text-white"
          : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// Navigation component uses React hooks above
export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827]">
          <Factory className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#111827] leading-tight">Vistral</span>
          <span className="text-[10px] text-[#9CA3AF] leading-tight uppercase tracking-wider">ERP</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {navigation.map((item) => (
            <NavItemComponent key={item.title} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
