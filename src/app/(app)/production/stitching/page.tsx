"use client";

import { Factory } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Stitching",
        description: "Monitor stitching production and line output.",
        icon: Factory,
        statusLabel: "Stitching status",
        emptyMessage: "No stitching batches yet. Create a production batch to begin stitching.",
        getStatus: (batch) => batch.stitching?.status ?? "PENDING",
      }}
    />
  );
}

