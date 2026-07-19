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
        getStatus: (batch) => batch.compacting?.status ?? "PENDING",
      }}
    />
  );
}

