"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Printing</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review print jobs and sample approval status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/production") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Production
          </Button>
          <Button onClick={() => router.push("/production") }>
            <Printer className="h-4 w-4 mr-2" /> Open Production
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Printing summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            See printing status and batch progress. Use the button above to return to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

