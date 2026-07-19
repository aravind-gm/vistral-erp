"use client";

import { Plus } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Grey Fabric",
        description: "Manage grey fabric processing and quality.",
        icon: Plus,
        statusLabel: "Fabric status",
        emptyMessage: "No grey fabric records yet. Create a production batch to start grey fabric processing.",
        getStatus: (batch) => batch.greyFabric?.inspectionStatus ?? "PENDING",
      }}
    />
  );
}

