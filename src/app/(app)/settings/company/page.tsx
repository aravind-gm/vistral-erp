"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Company</h1>
          <p className="text-sm text-[#6B7280] mt-1">Update company profile and business details.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/settings") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button onClick={() => router.push("/settings") }>
            <Building2 className="h-4 w-4 mr-2" /> Open Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Manage company details and settings. Use the button above to return to the settings overview.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

