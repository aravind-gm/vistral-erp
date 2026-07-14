"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import {
  ShoppingCart,
  Users,
  Factory,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#6B7280]">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-[#111827] font-mono tabular-nums">
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-[#9CA3AF]">{description}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F6]">
            <Icon className="h-5 w-5 text-[#374151]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  ENQUIRY: "Enquiry",
  QUOTATION_SENT: "Quotation",
  PO_RECEIVED: "PO Received",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  DISPATCHED: "Dispatched",
  INVOICED: "Invoiced",
  PAYMENT_RECEIVED: "Paid",
  CANCELLED: "Cancelled",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isAuthorized = Boolean(session?.user);

  useEffect(() => {
    if (!isPending && !isAuthorized) {
      router.replace("/login");
    }
  }, [isAuthorized, isPending, router]);

  const stats = api.dashboard.stats.useQuery(undefined, {
    enabled: isAuthorized,
  });
  const recentOrders = api.dashboard.recentOrders.useQuery(undefined, {
    enabled: isAuthorized,
  });

  if (isPending || !isAuthorized) {
    return (
      <div className="space-y-6 pt-4">
        <div className="h-8 w-48 rounded-xl bg-[#E5E7EB] animate-pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-3xl bg-[#E5E7EB] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Overview of Vistral ERP — Tiruppur Textile Manufacturing
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Orders"
          value={stats.data?.totalOrders ?? 0}
          icon={ShoppingCart}
          loading={stats.isLoading}
        />
        <StatCard
          title="Active Orders"
          value={stats.data?.activeOrders ?? 0}
          icon={TrendingUp}
          description="Confirmed & In Production"
          loading={stats.isLoading}
        />
        <StatCard
          title="Customers"
          value={stats.data?.totalCustomers ?? 0}
          icon={Users}
          loading={stats.isLoading}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.data?.pendingInvoices ?? 0}
          icon={Package}
          description="Awaiting payment"
          loading={stats.isLoading}
        />
        <StatCard
          title="Production Batches"
          value={stats.data?.productionBatches ?? 0}
          icon={Factory}
          description="Currently active"
          loading={stats.isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.data?.totalRevenue ?? 0)}
          icon={DollarSign}
          description="Paid invoices"
          loading={stats.isLoading}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-[#D1D5DB] mb-3" />
              <p className="text-sm font-medium text-[#374151]">No orders yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Orders will appear here once created
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {recentOrders.data?.map((order: typeof recentOrders.data[number]) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 py-3 hover:bg-[#FAFAFA] -mx-6 px-6 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#111827] font-mono">
                        {order.orderNo}
                      </span>
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {order.customer.name} &bull; {order.quantity.toLocaleString("en-IN")} pcs
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#6B7280]">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Delivery</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
