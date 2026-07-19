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
        getStatus: (batch) => batch.cutting?.status ?? "PENDING",
      }}
    />
  );
}

