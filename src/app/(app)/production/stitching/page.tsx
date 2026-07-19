"use client";

import { Factory } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Stitching",
        description: "Monitor stitching production and line output.",
        icon: Factory,
        statusLabel: "Stitching status",
        emptyMessage: "No stitching batches yet. Create a production batch to begin stitching.",
        stageNote: "Stitching is the assembly stage where cut pieces become finished garments, so output, rejection, line numbers, and supervisor notes matter here.",
        workflowSteps: ["Receive cut bundles", "Track stitched and rejected quantity", "Close the line before packing"],
        getStatus: (batch) => batch.stitching?.status ?? "PENDING",
        details: [
          { label: "Received qty", value: (batch) => batch.stitching?.receivedQty ?? "-" },
          { label: "Stitched qty", value: (batch) => batch.stitching?.stitchedQty ?? "-" },
          { label: "Rejected qty", value: (batch) => batch.stitching?.rejectedQty ?? "-" },
          { label: "Line no.", value: (batch) => batch.stitching?.lineNo ?? "-" },
          { label: "Supervisor", value: (batch) => batch.stitching?.supervisorName ?? "-" },
        ],
      }}
    />
  );
}

