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
  value: (batch: any) => any;
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

  const batches = api.production.listBatches.useQuery({ page: 1, limit: 100 });
  const selectedBatchQuery = api.production.getBatchById.useQuery(
    { id: selectedBatchId ?? "" },
    { enabled: Boolean(selectedBatchId) }
  );

  const updateKnitting = api.production.updateKnitting.useMutation();
  const updateGreyFabric = api.production.updateGreyFabric.useMutation();
  const updateDyeing = api.production.updateDyeing.useMutation();
  const updatePrinting = api.production.updatePrinting.useMutation();
  const updateCompacting = api.production.updateCompacting.useMutation();
  const updateChecking = api.production.updateChecking.useMutation();
  const updateCutting = api.production.updateCutting.useMutation();
  const updateStitching = api.production.updateStitching.useMutation();
  const updatePacking = api.production.updatePacking.useMutation();
  const updateDispatch = api.production.updateDispatch.useMutation();

  const getFieldsForStage = (title: string) => {
    switch (title) {
      case "Knitting":
        return [
          { name: "machineNo", label: "Machine No", type: "text" },
          { name: "gaugeNo", label: "Gauge No", type: "text" },
          { name: "diameter", label: "Diameter", type: "number" },
          { name: "gsm", label: "GSM", type: "number" },
          { name: "yarnIssued", label: "Yarn Issued (KG)", type: "number" },
          { name: "fabricProduced", label: "Fabric Produced (KG)", type: "number" },
          { name: "wastage", label: "Wastage (KG)", type: "number" },
          { name: "operatorName", label: "Operator Name", type: "text" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Grey Fabric":
        return [
          { name: "rollCount", label: "Roll Count", type: "number" },
          { name: "totalWeight", label: "Total Weight (KG)", type: "number" },
          { name: "gsm", label: "GSM", type: "number" },
          { name: "width", label: "Width (inches)", type: "number" },
          { name: "inspectedBy", label: "Inspected By", type: "text" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Dyeing":
        return [
          { name: "color", label: "Color", type: "text" },
          { name: "shade", label: "Shade", type: "text" },
          { name: "recipe", label: "Recipe", type: "text" },
          { name: "isInHouse", label: "In-House Routing", type: "boolean" },
          { name: "subcontractorId", label: "Subcontractor ID", type: "text" },
          { name: "fabricIn", label: "Fabric In (KG)", type: "number" },
          { name: "fabricOut", label: "Fabric Out (KG)", type: "number" },
          { name: "costPerKg", label: "Cost Per KG", type: "number" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Printing":
        return [
          { name: "printType", label: "Print Type", type: "text" },
          { name: "designRef", label: "Design Ref", type: "text" },
          { name: "isInHouse", label: "In-House Routing", type: "boolean" },
          { name: "subcontractorId", label: "Subcontractor ID", type: "text" },
          { name: "fabricIn", label: "Fabric In (KG)", type: "number" },
          { name: "fabricOut", label: "Fabric Out (KG)", type: "number" },
          { name: "costPerPc", label: "Cost Per PC", type: "number" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Compacting":
        return [
          { name: "fabricIn", label: "Fabric In (KG)", type: "number" },
          { name: "fabricOut", label: "Fabric Out (KG)", type: "number" },
          { name: "shrinkage", label: "Shrinkage %", type: "number" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Checking / QC":
        return [
          { name: "checkedQty", label: "Checked Qty", type: "number" },
          { name: "passedQty", label: "Passed Qty", type: "number" },
          { name: "rejectedQty", label: "Rejected Qty", type: "number" },
          { name: "inspectorName", label: "Inspector Name", type: "text" },
          { name: "defectDetails", label: "Defect Details", type: "textarea" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Cutting":
        return [
          { name: "pliesCount", label: "Plies Count", type: "number" },
          { name: "fabricUsed", label: "Fabric Used (KG)", type: "number" },
          { name: "cutPieces", label: "Cut Pieces Qty", type: "number" },
          { name: "wastage", label: "Wastage (KG)", type: "number" },
          { name: "markerEfficiency", label: "Marker Efficiency %", type: "number" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Stitching":
        return [
          { name: "receivedQty", label: "Received Qty", type: "number" },
          { name: "stitchedQty", label: "Stitched Qty", type: "number" },
          { name: "rejectedQty", label: "Rejected Qty", type: "number" },
          { name: "lineNo", label: "Line No", type: "text" },
          { name: "supervisorName", label: "Supervisor Name", type: "text" },
          { name: "costPerPc", label: "Cost Per PC", type: "number" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Packing":
        return [
          { name: "packedQty", label: "Packed Qty", type: "number" },
          { name: "cartons", label: "Cartons Count", type: "number" },
          { name: "grossWeight", label: "Gross Weight (KG)", type: "number" },
          { name: "netWeight", label: "Net Weight (KG)", type: "number" },
          { name: "packingType", label: "Packing Type", type: "text" },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ];
      case "Dispatch":
        return [
          { name: "vehicleNo", label: "Vehicle No", type: "text" },
          { name: "lrNo", label: "LR No (Lorry Receipt)", type: "text" },
          { name: "courier", label: "Courier/Transporter Name", type: "text" },
          { name: "trackingNo", label: "Tracking No", type: "text" },
          { name: "cartons", label: "Cartons Count", type: "number" },
          { name: "grossWeight", label: "Gross Weight (KG)", type: "number" },
          { name: "netWeight", label: "Net Weight (KG)", type: "number" },
          { name: "deliveryAddress", label: "Delivery Address", type: "textarea" },
          { name: "remarks", label: "Remarks", type: "textarea" },
          { name: "dispatchDate", label: "Dispatch Date", type: "date" },
        ];
      default:
        return [];
    }
  };

  const getStageRelation = (title: string, batch: any) => {
    switch (title) {
      case "Knitting":
        return batch.knitting;
      case "Grey Fabric":
        return batch.greyFabric;
      case "Dyeing":
        return batch.dyeingProcess;
      case "Printing":
        return batch.printingProcess;
      case "Compacting":
        return batch.compacting;
      case "Checking / QC":
        return batch.checking;
      case "Cutting":
        return batch.cutting;
      case "Stitching":
        return batch.stitching;
      case "Packing":
        return batch.packing;
      case "Dispatch":
        return batch.dispatch;
      default:
        return null;
    }
  };

  const startEditing = () => {
    if (!selectedBatch) return;
    const relation = getStageRelation(config.title, selectedBatch);
    const fields = getFieldsForStage(config.title);
    
    const initialData: Record<string, any> = {};
    
    if (config.title === "Grey Fabric") {
      initialData.inspectionStatus = relation?.inspectionStatus ?? "PENDING";
    } else if (config.title !== "Dispatch") {
      initialData.status = relation?.status ?? "PENDING";
    }
    
    fields.forEach((field) => {
      let val = relation?.[field.name];
      if (val !== undefined && val !== null) {
        if (field.type === "number") {
          initialData[field.name] = Number(val);
        } else if (field.type === "date") {
          try {
            initialData[field.name] = val instanceof Date ? val.toISOString().split("T")[0] : new Date(val).toISOString().split("T")[0];
          } catch {
            initialData[field.name] = "";
          }
        } else {
          initialData[field.name] = val;
        }
      } else {
        if (field.type === "boolean") {
          initialData[field.name] = false;
        } else if (field.type === "number") {
          initialData[field.name] = "";
        } else {
          initialData[field.name] = "";
        }
      }
    });
    
    setFormData(initialData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedBatch) return;
    
    const payload: Record<string, any> = {
      batchId: selectedBatch.id,
    };
    
    const fields = getFieldsForStage(config.title);
    
    if (config.title === "Grey Fabric") {
      payload.inspectionStatus = formData.inspectionStatus ?? "PENDING";
    } else if (config.title !== "Dispatch") {
      payload.status = formData.status ?? "PENDING";
    }
    
    fields.forEach((field) => {
      const val = formData[field.name];
      if (field.type === "number") {
        payload[field.name] = val === "" || val === undefined || val === null ? undefined : Number(val);
      } else if (field.type === "date") {
        payload[field.name] = val ? new Date(val) : undefined;
      } else if (field.type === "boolean") {
        payload[field.name] = Boolean(val);
      } else {
        payload[field.name] = val === "" ? undefined : val;
      }
    });

    try {
      switch (config.title) {
        case "Knitting":
          await updateKnitting.mutateAsync(payload as any);
          break;
        case "Grey Fabric":
          await updateGreyFabric.mutateAsync(payload as any);
          break;
        case "Dyeing":
          await updateDyeing.mutateAsync(payload as any);
          break;
        case "Printing":
          await updatePrinting.mutateAsync(payload as any);
          break;
        case "Compacting":
          await updateCompacting.mutateAsync(payload as any);
          break;
        case "Checking / QC":
          await updateChecking.mutateAsync(payload as any);
          break;
        case "Cutting":
          await updateCutting.mutateAsync(payload as any);
          break;
        case "Stitching":
          await updateStitching.mutateAsync(payload as any);
          break;
        case "Packing":
          await updatePacking.mutateAsync(payload as any);
          break;
        case "Dispatch":
          await updateDispatch.mutateAsync(payload as any);
          break;
      }
      
      toast.success(`${config.title} details updated successfully`);
      setIsEditing(false);
      batches.refetch();
      selectedBatchQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || `Failed to update ${config.title} details`);
    }
  };

  const selectedBatch = selectedBatchQuery.data as any;

  useEffect(() => {
    if (selectedBatch) {
      const status = config.getStatus(selectedBatch);
      const isCompleted = ["COMPLETED", "PASSED", "FAILED", "DISPATCHED"].includes(status);
      setCheckedItems(config.workflowSteps.map(() => isCompleted));
    }
  }, [selectedBatch?.id, config]);

  const rows = (batches.data?.data as any) ?? [];
  const summary = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((batch) => config.getStatus(batch) === "PENDING").length;
    const active = rows.filter((batch) => config.getStatus(batch) === "IN_PROGRESS").length;
    const completed = rows.filter((batch) => ["COMPLETED", "PASSED", "DISPATCHED"].includes(config.getStatus(batch))).length;
    const blocked = rows.filter((batch) => ["ON_HOLD", "FAILED"].includes(config.getStatus(batch))).length;

    return { total, pending, active, completed, blocked };
  }, [config, rows]);

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

      <Dialog open={Boolean(selectedBatchId)} onOpenChange={(open) => { if (!open) { setSelectedBatchId(null); setIsEditing(false); } }}>
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
                    <label key={step} className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 cursor-pointer items-start hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checkedItems[index] ?? false}
                        onChange={(e) => {
                          const updated = [...checkedItems];
                          updated[index] = e.target.checked;
                          setCheckedItems(updated);
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#111827] focus:ring-[#111827]"
                      />
                      <div>
                        <p className={`text-sm font-medium text-[#111827] ${checkedItems[index] ? 'line-through text-gray-400' : ''}`}>{step}</p>
                        <p className="text-xs text-[#6B7280]">Track this before handing over the batch.</p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>{config.title} process details</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      Edit details
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave} 
                        loading={
                          updateKnitting.isPending ||
                          updateGreyFabric.isPending ||
                          updateDyeing.isPending ||
                          updatePrinting.isPending ||
                          updateCompacting.isPending ||
                          updateChecking.isPending ||
                          updateCutting.isPending ||
                          updateStitching.isPending ||
                          updatePacking.isPending ||
                          updateDispatch.isPending
                        }
                      >
                        Save changes
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {config.title !== "Dispatch" && (
                        <div className="grid gap-2">
                          <Label htmlFor="stage-status-select">
                            {config.title === "Grey Fabric" ? "Inspection Status" : "Stage Status"}
                          </Label>
                          <Select
                            value={formData[config.title === "Grey Fabric" ? "inspectionStatus" : "status"] ?? "PENDING"}
                            onValueChange={(val) => {
                              setFormData({
                                ...formData,
                                [config.title === "Grey Fabric" ? "inspectionStatus" : "status"]: val
                              });
                            }}
                          >
                            <SelectTrigger id="stage-status-select">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {config.title === "Grey Fabric" ? (
                                <>
                                  <SelectItem value="PENDING">PENDING</SelectItem>
                                  <SelectItem value="PASSED">PASSED</SelectItem>
                                  <SelectItem value="FAILED">FAILED</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="PENDING">PENDING</SelectItem>
                                  <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                  <SelectItem value="ON_HOLD">ON HOLD</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        {getFieldsForStage(config.title).map((field) => (
                          <div key={field.name} className={`grid gap-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                            <Label htmlFor={`field-${field.name}`}>{field.label}</Label>
                            {field.type === "textarea" ? (
                              <Textarea
                                id={`field-${field.name}`}
                                value={formData[field.name] ?? ""}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                              />
                            ) : field.type === "boolean" ? (
                              <Select
                                value={formData[field.name] ? "true" : "false"}
                                onValueChange={(val) => setFormData({ ...formData, [field.name]: val === "true" })}
                              >
                                <SelectTrigger id={`field-${field.name}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes / In-house</SelectItem>
                                  <SelectItem value="false">No / Subcontract</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={`field-${field.name}`}
                                type={field.type}
                                value={formData[field.name] ?? ""}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
