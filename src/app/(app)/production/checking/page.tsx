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
        stageNote: "Checking is where the batch is inspected, defects are recorded, and the lot is either passed onward or held for rework.",
        workflowSteps: ["Count checked and passed quantity", "Log defects and rejection reasons", "Decide pass, hold, or rework"],
        getStatus: (batch) => batch.checking?.status ?? "PENDING",
        details: [
          { label: "Checked qty", value: (batch) => batch.checking?.checkedQty ?? "-" },
          { label: "Passed qty", value: (batch) => batch.checking?.passedQty ?? "-" },
          { label: "Rejected qty", value: (batch) => batch.checking?.rejectedQty ?? "-" },
          { label: "Inspector", value: (batch) => batch.checking?.inspectorName ?? "-" },
          { label: "Defects", value: (batch) => batch.checking?.defectDetails ?? "-" },
        ],
      }}
    />
  );
}

