"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Invoices</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review and manage customer invoices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/finance") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Finance
          </Button>
          <Button onClick={() => router.push("/finance") }>
            <FileText className="h-4 w-4 mr-2" /> Open Finance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Your invoice page is ready. Use the buttons above to return to the finance dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

