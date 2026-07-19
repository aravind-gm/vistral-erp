"use client";

import { Plus } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Dyeing",
        description: "Monitor dyeing operations and schedules.",
        icon: Plus,
        statusLabel: "Dyeing status",
        emptyMessage: "No dyeing batches found. Create a production batch to add dyeing work.",
        getStatus: (batch) => batch.dyeingProcess?.status ?? "PENDING",
      }}
    />
  );
}

