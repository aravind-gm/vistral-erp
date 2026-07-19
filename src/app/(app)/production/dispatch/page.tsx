"use client";

import { Truck } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Dispatch",
        description: "Track orders leaving the warehouse and delivery status.",
        icon: Truck,
        statusLabel: "Dispatch status",
        emptyMessage: "No dispatch batches yet. Create a production batch to begin dispatching.",
        getStatus: (batch) => batch.dispatch?.dispatchNo ? "DISPATCHED" : "PENDING",
      }}
    />
  );
}

