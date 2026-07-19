"use client";

import { Printer } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Printing",
        description: "Review print jobs and sample approval status.",
        icon: Printer,
        statusLabel: "Printing status",
        emptyMessage: "No printing batches yet. Create a production batch to add printing jobs.",
        getStatus: (batch) => batch.printingProcess?.status ?? "PENDING",
      }}
    />
  );
}

