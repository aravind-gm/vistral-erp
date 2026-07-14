"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id ?? ""),
    [params.id]
  );

  const { data: order, isLoading } = api.orders.byId.useQuery(
    { id: orderId },
    { enabled: Boolean(orderId) }
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 pt-4">
        <div className="text-lg font-semibold text-[#111827]">Order not found</div>
        <p className="text-sm text-[#6B7280]">The requested order could not be loaded.</p>
        <Button onClick={() => router.push("/orders")}>Back to orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Order {order.orderNo}</h1>
          <p className="text-sm text-[#6B7280] mt-1">Order details for {order.customer?.name ?? "customer"}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/orders")}>Back to orders</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280]">Order No</p>
              <p className="font-medium text-[#111827]">{order.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Status</p>
              <Badge variant={getOrderStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Customer</p>
              <p className="font-medium text-[#111827]">{order.customer?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Style</p>
              <p className="font-medium text-[#111827]">{order.styleName ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Delivery date</p>
              <p className="font-medium text-[#111827]">
                {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.orderDetails.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No items added to this order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-[#6B7280]">Color</th>
                      <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-[#6B7280]">Size</th>
                      <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-[#6B7280]">Qty</th>
                      <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-[#6B7280]">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-[#6B7280]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {order.orderDetails.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-3 py-2">{detail.color}</td>
                        <td className="px-3 py-2">{detail.size ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{detail.quantity}</td>
                        <td className="px-3 py-2 text-right">{detail.unitPrice.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right">{detail.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
