"use client";

import { Scissors } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Cutting",
        description: "Track cutting schedules and fabric preparation.",
        icon: Scissors,
        statusLabel: "Cutting status",
        emptyMessage: "No cutting batches yet. Create production batches to begin cutting.",
        stageNote: "Cutting converts approved fabric into pieces, so the team needs clear data for plies, fabric usage, cut pieces, and wastage before stitching can start.",
        workflowSteps: ["Confirm plies and marker plan", "Record fabric usage and cut pieces", "Pass bundles to stitching"],
        getStatus: (batch) => batch.cutting?.status ?? "PENDING",
        details: [
          { label: "Plies", value: (batch) => batch.cutting?.pliesCount ?? "-" },
          { label: "Fabric used", value: (batch) => batch.cutting?.fabricUsed ?? "-" },
          { label: "Cut pieces", value: (batch) => batch.cutting?.cutPieces ?? "-" },
          { label: "Wastage", value: (batch) => batch.cutting?.wastage ?? "-" },
          { label: "Marker efficiency", value: (batch) => batch.cutting?.markerEfficiency ?? "-" },
        ],
      }}
    />
  );
}

