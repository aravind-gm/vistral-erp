"use client";

import { Printer } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Printing",
        description: "Review print jobs and sample approval status.",
        icon: Printer,
        statusLabel: "Printing status",
        emptyMessage: "No printing batches yet. Create a production batch to add printing jobs.",
        stageNote: "Printing tracks the design reference, print method, and fabric movement so the team knows which lot is being decorated and when it can move on.",
        workflowSteps: ["Validate design reference", "Track in-house or vendor route", "Record fabric movement and completion"],
        getStatus: (batch) => batch.printingProcess?.status ?? "PENDING",
        details: [
          { label: "Print type", value: (batch) => batch.printingProcess?.printType ?? "-" },
          { label: "Design ref", value: (batch) => batch.printingProcess?.designRef ?? "-" },
          { label: "Route", value: (batch) => (batch.printingProcess?.isInHouse ? "In-house" : "Subcontract") },
          { label: "Fabric in", value: (batch) => batch.printingProcess?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.printingProcess?.fabricOut ?? "-" },
          { label: "Cost / pc", value: (batch) => batch.printingProcess?.costPerPc ?? "-" },
        ],
      }}
    />
  );
}

