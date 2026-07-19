"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { formatDate } from "@/features/dashboard/utils/formatters";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  PENDING: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  ON_HOLD: "destructive",
  PASSED: "success",
  FAILED: "destructive",
  DISPATCHED: "success",
  NOT_STARTED: "secondary",
};

export type ProductionPhaseDetail = {
  label: string;
  value: (batch: any) => ReactNode;
};

export type ProductionPhaseConfig = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  statusLabel: string;
  emptyMessage: string;
  getStatus: (batch: any) => string;
  details: ProductionPhaseDetail[];
};

const formatDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return formatDate(value);
  }
  return String(value);
};

export function ProductionPhasePanel({ config }: { config: ProductionPhaseConfig }) {
  const router = useRouter();
  const batches = api.production.listBatches.useQuery({ page: 1, limit: 100 });

  const rows = batches.data?.data ?? [];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{config.title}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/production") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Production
          </Button>
          <Button onClick={() => router.push("/production/new") }>
            {config.icon ? <config.icon className="h-4 w-4 mr-2" /> : null} New Batch
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.title} batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {batches.isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : !rows.length ? (
            <div className="p-12 text-center text-gray-400">
              <p className="font-medium">No production batches found</p>
              <p className="text-sm mt-1">{config.emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Batch</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Order</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">{config.statusLabel}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Created</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Stage work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((batch: any) => {
                    const status = config.getStatus(batch);
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono font-medium">{batch.batchNo}</td>
                        <td className="px-6 py-4 text-gray-600">{batch.order?.orderNo ?? "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{batch.order?.customer?.name ?? "-"}</td>
                        <td className="px-6 py-4">
                          <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{batch.createdAt ? formatDate(batch.createdAt) : "-"}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-xs text-gray-600">
                            {config.details.map((detail) => (
                              <div key={detail.label} className="flex gap-1">
                                <span className="font-semibold text-gray-700">{detail.label}:</span>
                                <span>{typeof detail.value(batch) === "string" ? formatDetailValue(detail.value(batch)) : detail.value(batch)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
