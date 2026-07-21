"use client";

import { Factory } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Bio Wash",
        description: "Review and record bio-wash finishing jobs.",
        icon: Factory,
        statusLabel: "Bio Wash status",
        emptyMessage: "No bio-wash batches yet. Create a new production batch to begin bio-washing.",
        stageNote: "Bio-wash finishing applies enzymes to reduce fabric pilling, soften textures, and improve print/hand-feel readiness.",
        workflowSteps: ["Verify enzyme type and chemical mix", "Verify fabric in/out weight", "Record status and completion details"],
        getStatus: (batch) => batch.bioWash?.status ?? "PENDING",
        details: [
          { label: "Fabric in", value: (batch) => batch.bioWash?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.bioWash?.fabricOut ?? "-" },
          { label: "Enzyme Used", value: (batch) => batch.bioWash?.enzymeUsed ?? "-" },
          { label: "Start", value: (batch) => batch.bioWash?.startDate ?? "-" },
          { label: "Completed", value: (batch) => batch.bioWash?.completedDate ?? "-" },
        ],
      }}
    />
  );
}
