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
        getStatus: (batch) => batch.knitting?.status ?? "PENDING",
      }}
    />
  );
}

