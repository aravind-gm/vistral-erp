"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dispatch</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track orders leaving the warehouse and delivery status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/production") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Production
          </Button>
          <Button onClick={() => router.push("/production") }>
            <Truck className="h-4 w-4 mr-2" /> Open Production
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Dispatch tracking is ready. Use the button above to return to the production dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

