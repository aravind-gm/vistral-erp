"use client";

import { Factory } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Centering",
        description: "Review and record centering process jobs.",
        icon: Factory,
        statusLabel: "Centering status",
        emptyMessage: "No centering batches yet. Create a new production batch to begin centering.",
        stageNote: "Centering controls and adjusts open-width fabric alignment and width before compacting or printing processes.",
        workflowSteps: ["Verify width parameters", "Verify fabric in/out weight details", "Record status and details"],
        getStatus: (batch) => batch.centering?.status ?? "PENDING",
        details: [
          { label: "Fabric in", value: (batch) => batch.centering?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.centering?.fabricOut ?? "-" },
          { label: "Width (inches)", value: (batch) => batch.centering?.widthInches ?? "-" },
          { label: "Start", value: (batch) => batch.centering?.startDate ?? "-" },
          { label: "Completed", value: (batch) => batch.centering?.completedDate ?? "-" },
        ],
      }}
    />
  );
}
