"use client";

import { Plus } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Knitting",
        description: "Track knitting jobs and batch progress.",
        icon: Plus,
        statusLabel: "Knitting status",
        emptyMessage: "No knitting batches yet. Create a production batch to start knitting.",
        stageNote: "Knitting is the first floor stage where yarn is issued, machine settings are fixed, and fabric output is recorded before the batch moves to grey fabric handling.",
        workflowSteps: ["Issue yarn and confirm batch", "Set machine, gauge, and diameter", "Record output, wastage, and operator remarks"],
        getStatus: (batch) => batch.knitting?.status ?? "PENDING",
        details: [
          { label: "Machine", value: (batch) => batch.knitting?.machineNo ?? "-" },
          { label: "Gauge", value: (batch) => batch.knitting?.gaugeNo ?? "-" },
          { label: "Diameter", value: (batch) => batch.knitting?.diameter ?? "-" },
          { label: "GSM", value: (batch) => batch.knitting?.gsm ?? "-" },
          { label: "Yarn issued", value: (batch) => batch.knitting?.yarnIssued ?? "-" },
          { label: "Fabric produced", value: (batch) => batch.knitting?.fabricProduced ?? "-" },
          { label: "Wastage", value: (batch) => batch.knitting?.wastage ?? "-" },
          { label: "Operator", value: (batch) => batch.knitting?.operatorName ?? "-" },
        ],
      }}
    />
  );
}

