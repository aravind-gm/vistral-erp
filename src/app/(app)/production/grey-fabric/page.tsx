"use client";

import { Plus } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Grey Fabric",
        description: "Manage grey fabric processing and quality.",
        icon: Plus,
        statusLabel: "Fabric status",
        emptyMessage: "No grey fabric records yet. Create a production batch to start grey fabric processing.",
        stageNote: "Grey fabric work captures the raw knitted output, measures roll count and weight, and prepares the lot for inspection before dyeing or finishing.",
        workflowSteps: ["Receive knitted fabric rolls", "Measure weight, GSM, and width", "Inspect and mark pass or hold"],
        getStatus: (batch) => batch.greyFabric?.inspectionStatus ?? "PENDING",
        details: [
          { label: "Roll count", value: (batch) => batch.greyFabric?.rollCount ?? "-" },
          { label: "Total weight", value: (batch) => batch.greyFabric?.totalWeight ?? "-" },
          { label: "GSM", value: (batch) => batch.greyFabric?.gsm ?? "-" },
          { label: "Width", value: (batch) => batch.greyFabric?.width ?? "-" },
          { label: "Inspected by", value: (batch) => batch.greyFabric?.inspectedBy ?? "-" },
          { label: "Inspection time", value: (batch) => batch.greyFabric?.inspectedAt ?? "-" },
        ],
      }}
    />
  );
}

