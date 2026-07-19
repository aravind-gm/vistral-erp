"use client";

import { BoxSelect } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Packing",
        description: "Manage packing jobs and shipping preparation.",
        icon: BoxSelect,
        statusLabel: "Packing status",
        emptyMessage: "No packing batches yet. Create a production batch to start packing.",
        getStatus: (batch) => batch.packing?.status ?? "PENDING",
      }}
    />
  );
}

