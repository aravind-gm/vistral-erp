"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { formatDate } from "@/features/dashboard/utils/formatters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

export type ProductionBatchRecord = {
  id: string;
  batchNo: string;
  quantity: number;
  status: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  remarks?: string | null;
  order?: {
    orderNo?: string | null;
    styleName?: string | null;
    customer?: {
      name?: string | null;
    } | null;
  } | null;
  knitting?: {
    status?: string | null;
    machineNo?: string | null;
    gaugeNo?: string | null;
    diameter?: string | number | null;
    gsm?: string | number | null;
    yarnIssued?: string | number | null;
    fabricProduced?: string | number | null;
    wastage?: string | number | null;
    operatorName?: string | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  greyFabric?: {
    inspectionStatus?: string | null;
    rollCount?: number | null;
    totalWeight?: string | number | null;
    gsm?: string | number | null;
    width?: string | number | null;
    inspectedBy?: string | null;
    inspectedAt?: Date | string | null;
    remarks?: string | null;
  } | null;
  dyeingProcess?: {
    status?: string | null;
    color?: string | null;
    shade?: string | null;
    recipe?: string | null;
    isInHouse?: boolean | null;
    fabricIn?: string | number | null;
    fabricOut?: string | number | null;
    costPerKg?: string | number | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  printingProcess?: {
    status?: string | null;
    printType?: string | null;
    designRef?: string | null;
    isInHouse?: boolean | null;
    fabricIn?: string | number | null;
    fabricOut?: string | number | null;
    costPerPc?: string | number | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  compacting?: {
    status?: string | null;
    fabricIn?: string | number | null;
    fabricOut?: string | number | null;
    shrinkage?: string | number | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  checking?: {
    status?: string | null;
    checkedQty?: number | null;
    passedQty?: number | null;
    rejectedQty?: number | null;
    defectDetails?: string | null;
    inspectorName?: string | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  cutting?: {
    status?: string | null;
    pliesCount?: number | null;
    fabricUsed?: string | number | null;
    cutPieces?: number | null;
    wastage?: string | number | null;
    markerEfficiency?: string | number | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  stitching?: {
    status?: string | null;
    receivedQty?: number | null;
    stitchedQty?: number | null;
    rejectedQty?: number | null;
    lineNo?: string | null;
    supervisorName?: string | null;
    costPerPc?: string | number | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  packing?: {
    status?: string | null;
    packedQty?: number | null;
    cartons?: number | null;
    grossWeight?: string | number | null;
    netWeight?: string | number | null;
    packingType?: string | null;
    startDate?: Date | string | null;
    completedDate?: Date | string | null;
    remarks?: string | null;
  } | null;
  dispatch?: {
    dispatchNo?: string | null;
    vehicleNo?: string | null;
    lrNo?: string | null;
    courier?: string | null;
    trackingNo?: string | null;
    cartons?: number | null;
    grossWeight?: string | number | null;
    netWeight?: string | number | null;
    dispatchDate?: Date | string | null;
    remarks?: string | null;
  } | null;
};

export type ProductionPhaseDetail = {
  label: string;
  value: (batch: ProductionBatchRecord) => ReactNode;
};

export type ProductionPhaseConfig = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  statusLabel: string;
  emptyMessage: string;
  stageNote: string;
  workflowSteps: string[];
  getStatus: (batch: ProductionBatchRecord) => string;
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
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const batches = api.production.listBatches.useQuery({ page: 1, limit: 100 });
  const selectedBatchQuery = api.production.getBatchById.useQuery(
    { id: selectedBatchId ?? "" },
    { enabled: Boolean(selectedBatchId) }
  );

  const rows = batches.data?.data ?? [];
  const summary = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((batch) => config.getStatus(batch) === "PENDING").length;
    const active = rows.filter((batch) => config.getStatus(batch) === "IN_PROGRESS").length;
    const completed = rows.filter((batch) => ["COMPLETED", "PASSED", "DISPATCHED"].includes(config.getStatus(batch))).length;
    const blocked = rows.filter((batch) => ["ON_HOLD", "FAILED"].includes(config.getStatus(batch))).length;

    return { total, pending, active, completed, blocked };
  }, [config, rows]);

  const selectedBatch = selectedBatchQuery.data;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{config.title}</h1>
          <p className="mt-1 text-sm text-[#6B7280]">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/production")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Production
          </Button>
          <Button onClick={() => router.push("/production/new")}>
            {config.icon ? <config.icon className="h-4 w-4 mr-2" /> : null} New Batch
          </Button>
        </div>
      </div>

      <Card className="border-[#111827] bg-[#111827] text-white shadow-sm">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Stage focus</p>
            <h2 className="mt-2 text-xl font-semibold">What this stage does</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">{config.stageNote}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {config.workflowSteps.map((step) => (
                <span key={step} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/55">Total batches</p>
              <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/55">Active</p>
              <p className="mt-2 text-2xl font-semibold">{summary.active}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/55">Completed</p>
              <p className="mt-2 text-2xl font-semibold">{summary.completed}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/55">Blocked</p>
              <p className="mt-2 text-2xl font-semibold">{summary.blocked}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#6B7280]">Queue ready</p>
            <p className="mt-1 text-3xl font-bold text-[#111827]">{summary.pending}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">batches waiting to enter {config.title.toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]"><Clock3 className="h-4 w-4" /> In progress</div>
            <p className="mt-1 text-3xl font-bold text-[#111827]">{summary.active}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">work currently on the floor</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]"><CheckCircle2 className="h-4 w-4" /> Done</div>
            <p className="mt-1 text-3xl font-bold text-[#111827]">{summary.completed}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">ready for the next handoff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]"><TriangleAlert className="h-4 w-4" /> Attention</div>
            <p className="mt-1 text-3xl font-bold text-[#111827]">{summary.blocked}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">held or failed items needing review</p>
          </CardContent>
        </Card>
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
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Work items</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((batch) => {
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
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedBatchId(batch.id)}>
                            Open workspace
                          </Button>
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

      <Dialog open={Boolean(selectedBatchId)} onOpenChange={(open) => !open && setSelectedBatchId(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBatch?.batchNo ?? "Batch workspace"}</DialogTitle>
            <DialogDescription>
              Review the current stage work, batch data, and handoff checkpoints before moving this batch forward.
            </DialogDescription>
          </DialogHeader>

          {selectedBatchQuery.isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedBatch ? (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Batch snapshot</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Order</p>
                    <p className="mt-1 font-medium text-[#111827]">{selectedBatch.order?.orderNo ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Customer</p>
                    <p className="mt-1 font-medium text-[#111827]">{selectedBatch.order?.customer?.name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Quantity</p>
                    <p className="mt-1 font-medium text-[#111827]">{selectedBatch.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Current stage status</p>
                    <Badge className="mt-1" variant={STATUS_VARIANT[config.getStatus(selectedBatch)] ?? "secondary"}>
                      {config.getStatus(selectedBatch)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Created</p>
                    <p className="mt-1 font-medium text-[#111827]">{formatDate(selectedBatch.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Updated</p>
                    <p className="mt-1 font-medium text-[#111827]">{selectedBatch.updatedAt ? formatDate(selectedBatch.updatedAt) : "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">Batch remarks</p>
                    <p className="mt-1 text-sm leading-6 text-[#374151]">{selectedBatch.remarks ?? "-"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stage checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.workflowSteps.map((step, index) => (
                    <div key={step} className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{step}</p>
                        <p className="text-xs text-[#6B7280]">Track this before handing over the batch.</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{config.title} process details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {config.details.map((detail) => {
                    const value = detail.value(selectedBatch);
                    return (
                      <div key={detail.label} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                        <p className="text-xs uppercase tracking-wide text-[#9CA3AF]">{detail.label}</p>
                        <div className="mt-2 text-sm font-medium text-[#111827]">
                          {typeof value === "string" ? formatDetailValue(value) : value}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-sm text-[#6B7280]">
              This batch could not be loaded.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
