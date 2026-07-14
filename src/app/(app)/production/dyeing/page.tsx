"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dyeing</h1>
          <p className="text-sm text-[#6B7280] mt-1">Monitor dyeing operations and schedules.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/production") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={() => router.push("/production") }>
            <Plus className="h-4 w-4 mr-2" /> View Production
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dyeing summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#4B5563]">
            Monitor dyeing status and production schedules. Use the buttons above to return to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

