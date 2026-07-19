"use client";

import { BoxSelect } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Packing",
        description: "Manage packing jobs and shipping preparation.",
        icon: BoxSelect,
        statusLabel: "Packing status",
        emptyMessage: "No packing batches yet. Create a production batch to start packing.",
        stageNote: "Packing turns stitched output into shipment-ready cartons, so the batch must show packed quantity, carton count, and packing type before dispatch can be raised.",
        workflowSteps: ["Confirm packed quantity", "Record carton and weight details", "Release batch for dispatch"],
        getStatus: (batch) => batch.packing?.status ?? "PENDING",
        details: [
          { label: "Packed qty", value: (batch) => batch.packing?.packedQty ?? "-" },
          { label: "Cartons", value: (batch) => batch.packing?.cartons ?? "-" },
          { label: "Gross weight", value: (batch) => batch.packing?.grossWeight ?? "-" },
          { label: "Net weight", value: (batch) => batch.packing?.netWeight ?? "-" },
          { label: "Packing type", value: (batch) => batch.packing?.packingType ?? "-" },
        ],
      }}
    />
  );
}

