"use client";

import { Layers } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Compacting",
        description: "Review compacting jobs and product readiness.",
        icon: Layers,
        statusLabel: "Compacting status",
        emptyMessage: "No compacting batches yet. Create a new production batch to begin compacting.",
        stageNote: "Compacting sets the final finish, shrinkage, and fabric balance before inspection and cutting, so this stage must show clear in/out numbers.",
        workflowSteps: ["Confirm fabric in/out balance", "Record shrinkage and finishing result", "Release the lot for QC"],
        getStatus: (batch) => batch.compacting?.status ?? "PENDING",
        details: [
          { label: "Fabric in", value: (batch) => batch.compacting?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.compacting?.fabricOut ?? "-" },
          { label: "Shrinkage", value: (batch) => batch.compacting?.shrinkage ?? "-" },
          { label: "Start", value: (batch) => batch.compacting?.startDate ?? "-" },
          { label: "Completed", value: (batch) => batch.compacting?.completedDate ?? "-" },
        ],
      }}
    />
  );
}

