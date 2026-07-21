"use client";

import { Factory } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Heatsetting",
        description: "Review and record heatsetting jobs.",
        icon: Factory,
        statusLabel: "Heatsetting status",
        emptyMessage: "No heatsetting batches yet. Create a new production batch to begin heatsetting.",
        stageNote: "Heatsetting stabilizes fabric dimensions, controls weight/width, and sets thermoplastic fibers before centering and printing/compacting.",
        workflowSteps: ["Confirm temperature & speed parameters", "Verify fabric in/out quantities", "Record status and transition"],
        getStatus: (batch) => batch.heatsetting?.status ?? "PENDING",
        details: [
          { label: "Fabric in", value: (batch) => batch.heatsetting?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.heatsetting?.fabricOut ?? "-" },
          { label: "Temperature (°C)", value: (batch) => batch.heatsetting?.tempCelsius ?? "-" },
          { label: "Speed (m/min)", value: (batch) => batch.heatsetting?.speedMpm ?? "-" },
          { label: "Start", value: (batch) => batch.heatsetting?.startDate ?? "-" },
          { label: "Completed", value: (batch) => batch.heatsetting?.completedDate ?? "-" },
        ],
      }}
    />
  );
}
