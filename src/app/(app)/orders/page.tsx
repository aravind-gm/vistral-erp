"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Download, MoreHorizontal, ShoppingCart,
} from "lucide-react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ENQUIRY", label: "Enquiry" },
  { value: "QUOTATION_SENT", label: "Quotation Sent" },
  { value: "PO_RECEIVED", label: "PO Received" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "PAYMENT_RECEIVED", label: "Payment Received" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const utils = api.useUtils();

  const { data, isLoading } = api.orders.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const deleteMutation = api.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Order deleted");
      void utils.orders.list.invalidate();
    },
  });

  const updateStatusMutation = api.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      void utils.orders.list.invalidate();
    },
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Orders</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Manage customer orders from enquiry to dispatch
          </p>
        </div>
        <Button onClick={() => router.push("/orders/new")}>
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            startIcon={<Search className="h-4 w-4" />}
            placeholder="Search order no, style, customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-[#F3F4F6]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-4 w-28 font-mono" />
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-12 w-12 text-[#D1D5DB] mb-3" />
              <p className="text-sm font-medium text-[#374151]">
                {search || status !== "ALL" ? "No orders found" : "No orders yet"}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {search || status !== "ALL" ? "Try different filters" : "Create your first order"}
              </p>
              {!search && status === "ALL" && (
                <Button className="mt-4" size="sm" onClick={() => router.push("/orders/new")}>
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[120px_1fr_160px_140px_80px_80px_40px] items-center gap-4 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Order No</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Customer / Style</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Delivery</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Qty</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date</span>
                <span />
              </div>

              <div className="divide-y divide-[#F3F4F6]">
                {data?.data.map((order: typeof data.data[number]) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-[120px_1fr_160px_140px_80px_80px_40px] items-center gap-4 px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <span
                      className="font-mono text-sm font-medium text-[#111827] cursor-pointer hover:text-[#374151]"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      {order.orderNo}
                    </span>

                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <p className="text-sm font-medium text-[#111827]">{order.customer.name}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {order.styleName ?? order.buyerOrderNo ?? "—"}
                      </p>
                    </div>

                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                    </Badge>

                    <span className="text-sm text-[#374151]">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
                    </span>

                    <span className="font-mono text-sm text-[#374151]">
                      {order.quantity.toLocaleString("en-IN")}
                    </span>

                    <span className="text-xs text-[#9CA3AF]">
                      {formatDate(order.createdAt)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status === "ENQUIRY" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order.id, status: "CONFIRMED" })
                            }
                          >
                            Mark as Confirmed
                          </DropdownMenuItem>
                        )}
                        {order.status === "CONFIRMED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order.id, status: "IN_PRODUCTION" })
                            }
                          >
                            Start Production
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[#DC2626] focus:text-[#DC2626] focus:bg-[#FEE2E2]"
                          onClick={() => {
                            if (confirm("Delete this order?")) {
                              deleteMutation.mutate({ id: order.id });
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
                  <p className="text-xs text-[#6B7280]">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} of {data.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
