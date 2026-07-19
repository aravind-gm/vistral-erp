"use client";

import { UserCheck } from "lucide-react";
import { ProductionPhasePanel } from "@/features/production/components/production-phase-panel";

export default function Page() {
  return (
    <ProductionPhasePanel
      config={{
        title: "Checking / QC",
        description: "Manage quality inspection and product checks.",
        icon: UserCheck,
        statusLabel: "QC status",
        emptyMessage: "No QC batches yet. Create production batches to start quality checks.",
        getStatus: (batch) => batch.checking?.status ?? "PENDING",
      }}
    />
  );
}

