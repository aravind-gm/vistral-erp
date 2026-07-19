"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";

type CostingForm = {
  yarnCost: number;
  knittingCost: number;
  dyeingCost: number;
  printingCost: number;
  compactingCost: number;
  cuttingCost: number;
  stitchingCost: number;
  packingCost: number;
  overheadPercent: number;
  profitPercent: number;
  remarks: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();
  const orderId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id ?? ""),
    [params.id]
  );

  const { data: order, isLoading } = api.orders.byId.useQuery(
    { id: orderId },
    { enabled: Boolean(orderId) }
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CostingForm>({
    defaultValues: {
      yarnCost: 0,
      knittingCost: 0,
      dyeingCost: 0,
      printingCost: 0,
      compactingCost: 0,
      cuttingCost: 0,
      stitchingCost: 0,
      packingCost: 0,
      overheadPercent: 10,
      profitPercent: 15,
      remarks: "",
    },
  });

  const updateCosting = api.orders.updateCosting.useMutation({
    onSuccess: () => {
      toast.success("Order costing updated");
      void utils.orders.byId.invalidate({ id: orderId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!order) return;

    reset({
      yarnCost: Number(order.orderCosting?.yarnCost ?? 0),
      knittingCost: Number(order.orderCosting?.knittingCost ?? 0),
      dyeingCost: Number(order.orderCosting?.dyeingCost ?? 0),
      printingCost: Number(order.orderCosting?.printingCost ?? 0),
      compactingCost: Number(order.orderCosting?.compactingCost ?? 0),
      cuttingCost: Number(order.orderCosting?.cuttingCost ?? 0),
      stitchingCost: Number(order.orderCosting?.stitchingCost ?? 0),
      packingCost: Number(order.orderCosting?.packingCost ?? 0),
      overheadPercent: Number(order.orderCosting?.overheadPercent ?? 10),
      profitPercent: Number(order.orderCosting?.profitPercent ?? 15),
      remarks: order.orderCosting?.remarks ?? "",
    });
  }, [order, reset]);

  const watched = watch();
  const totalCost = useMemo(() => {
    return (
      watched.yarnCost +
      watched.knittingCost +
      watched.dyeingCost +
      watched.printingCost +
      watched.compactingCost +
      watched.cuttingCost +
      watched.stitchingCost +
      watched.packingCost
    );
  }, [watched]);

  const totalWithOverhead = useMemo(() => {
    return totalCost + (totalCost * watched.overheadPercent) / 100;
  }, [totalCost, watched.overheadPercent]);

  const sellingPrice = useMemo(() => {
    return totalWithOverhead + (totalWithOverhead * watched.profitPercent) / 100;
  }, [totalWithOverhead, watched.profitPercent]);

  const onSubmit = (values: CostingForm) => {
    updateCosting.mutate({
      orderId,
      ...values,
    });
  };

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
                        <td className="px-3 py-2 text-right">{Number(detail.unitPrice).toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right">{Number(detail.amount).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order costing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#374151]">Yarn cost</label>
                <Input type="number" step="0.01" {...register("yarnCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Knitting cost</label>
                <Input type="number" step="0.01" {...register("knittingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Dyeing cost</label>
                <Input type="number" step="0.01" {...register("dyeingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Printing cost</label>
                <Input type="number" step="0.01" {...register("printingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Compacting cost</label>
                <Input type="number" step="0.01" {...register("compactingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Cutting cost</label>
                <Input type="number" step="0.01" {...register("cuttingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Stitching cost</label>
                <Input type="number" step="0.01" {...register("stitchingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Packing cost</label>
                <Input type="number" step="0.01" {...register("packingCost", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Overhead %</label>
                <Input type="number" step="0.1" {...register("overheadPercent", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151]">Profit %</label>
                <Input type="number" step="0.1" {...register("profitPercent", { valueAsNumber: true })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#374151]">Remarks</label>
              <Textarea rows={4} {...register("remarks")} />
            </div>

            <div className="grid gap-4 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-[#6B7280]">Total cost</p>
                <p className="text-lg font-semibold text-[#111827]">{totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Cost after overhead</p>
                <p className="text-lg font-semibold text-[#111827]">{totalWithOverhead.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Selling price</p>
                <p className="text-lg font-semibold text-[#111827]">{sellingPrice.toFixed(2)}</p>
              </div>
            </div>

            <Button type="submit" loading={updateCosting.isLoading}>
              Save costing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
