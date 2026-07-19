"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "INVOICED", label: "Invoiced" },
];

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = api.orders.list.useQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
    search: search || undefined,
  });

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Order Costing</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage order costing details and estimates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/orders") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Order costing overview</CardTitle>
            <p className="text-sm text-[#4B5563]">Select an order to view or enter costing details.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders..."
              className="min-w-[240px]"
            />
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="p-10 text-center text-sm text-[#6B7280]">
              <p className="font-medium text-[#111827]">No order costing records found</p>
              <p className="mt-2">Open an order to enter costing details once the order is confirmed.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-b-xl border-t border-gray-200">
              <div className="grid grid-cols-[160px_1fr_140px_140px_120px_120px_120px] gap-4 bg-[#F9FAFB] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <span>Order No</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Delivery</span>
                <span>Qty</span>
                <span>Costing</span>
                <span>Action</span>
              </div>
              <div className="divide-y divide-gray-100 bg-white">
                {data.data.map((order) => (
                  <div key={order.id} className="grid grid-cols-[160px_1fr_140px_140px_120px_120px_120px] items-center gap-4 px-4 py-3 hover:bg-[#FAFAFA]">
                    <span className="font-mono text-sm text-[#111827]">{order.orderNo}</span>
                    <span className="text-sm text-[#374151]">{order.customer.name}</span>
                    <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
                    <span className="text-sm text-[#374151]">{order.deliveryDate ? formatDate(order.deliveryDate) : "-"}</span>
                    <span className="text-sm text-[#374151]">{order.quantity.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-[#374151]">{order.orderCosting ? "Ready" : "Pending"}</span>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/orders/${order.id}`)}>
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
