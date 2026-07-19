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
        stageNote: "Dyeing transforms grey fabric into the required shade, whether done in-house or through a subcontractor, and tracks the batch from fabric in to fabric out.",
        workflowSteps: ["Confirm shade and recipe", "Record fabric in and dye house route", "Close the lot with fabric out and remarks"],
        getStatus: (batch) => batch.dyeingProcess?.status ?? "PENDING",
        details: [
          { label: "Color", value: (batch) => batch.dyeingProcess?.color ?? "-" },
          { label: "Shade", value: (batch) => batch.dyeingProcess?.shade ?? "-" },
          { label: "Recipe", value: (batch) => batch.dyeingProcess?.recipe ?? "-" },
          { label: "Route", value: (batch) => (batch.dyeingProcess?.isInHouse ? "In-house" : "Subcontract") },
          { label: "Fabric in", value: (batch) => batch.dyeingProcess?.fabricIn ?? "-" },
          { label: "Fabric out", value: (batch) => batch.dyeingProcess?.fabricOut ?? "-" },
          { label: "Cost / kg", value: (batch) => batch.dyeingProcess?.costPerKg ?? "-" },
        ],
      }}
    />
  );
}

