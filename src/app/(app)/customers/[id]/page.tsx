"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/features/dashboard/utils/formatters";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id ?? ""),
    [params.id]
  );

  const { data: customer, isLoading } = api.customers.byId.useQuery(
    { id: customerId },
    { enabled: Boolean(customerId) }
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

  if (!customer) {
    return (
      <div className="space-y-4 pt-4">
        <div className="text-lg font-semibold text-[#111827]">Customer not found</div>
        <p className="text-sm text-[#6B7280]">The requested customer could not be loaded.</p>
        <Button onClick={() => router.push("/customers")}>Back to customers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{customer.name}</h1>
          <p className="text-sm text-[#6B7280] mt-1">Customer profile and recent orders</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/customers")}>Back to customers</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280]">Code</p>
              <p className="font-medium text-[#111827]">{customer.code}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Contact person</p>
              <p className="font-medium text-[#111827]">{customer.contactPerson ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Phone</p>
              <p className="font-medium text-[#111827]">{customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Email</p>
              <p className="font-medium text-[#111827]">{customer.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Address</p>
              <p className="font-medium text-[#111827]">
                {customer.addressLine1}
                {customer.addressLine2 ? `, ${customer.addressLine2}` : ""}
                {customer.city ? `, ${customer.city}` : ""}
                {customer.state ? `, ${customer.state}` : ""}
                {customer.pincode ? ` - ${customer.pincode}` : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.orders.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No recent orders for this customer.</p>
            ) : (
              <div className="space-y-3">
                {customer.orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#111827]">{order.orderNo}</p>
                        <p className="text-xs text-[#6B7280]">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-[#6B7280] mt-2">
                      Quantity: {order.quantity.toLocaleString("en-IN")} {order.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
