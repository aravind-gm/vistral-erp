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
        stageNote: "Dispatch is the final production handoff. It must show the dispatch note, vehicle or courier reference, carton count, and weight before the batch leaves the factory.",
        workflowSteps: ["Prepare dispatch note", "Confirm vehicle or courier reference", "Record cartons, weights, and delivery address"],
        getStatus: (batch) => (batch.dispatch?.dispatchNo ? "DISPATCHED" : "PENDING"),
        details: [
          { label: "Dispatch no.", value: (batch) => batch.dispatch?.dispatchNo ?? "-" },
          { label: "Vehicle no.", value: (batch) => batch.dispatch?.vehicleNo ?? "-" },
          { label: "LR no.", value: (batch) => batch.dispatch?.lrNo ?? "-" },
          { label: "Courier", value: (batch) => batch.dispatch?.courier ?? "-" },
          { label: "Tracking no.", value: (batch) => batch.dispatch?.trackingNo ?? "-" },
          { label: "Cartons", value: (batch) => batch.dispatch?.cartons ?? "-" },
        ],
      }}
    />
  );
}

