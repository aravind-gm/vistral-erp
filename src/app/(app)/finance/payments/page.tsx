"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Payments</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track payment receipts and supplier payouts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/finance") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Finance
          </Button>
          <Button onClick={() => router.push("/finance") }>
            <DollarSign className="h-4 w-4 mr-2" /> Open Finance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Monitor payments and cash flow. Return to the finance dashboard using the buttons above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

