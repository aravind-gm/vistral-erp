"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Yarn Types</h1>
          <p className="text-sm text-[#6B7280] mt-1">Define yarn categories and specifications.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/yarn") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Yarn
          </Button>
          <Button onClick={() => router.push("/yarn") }>
            <Package className="h-4 w-4 mr-2" /> Open Yarn
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yarn type settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Manage yarn type definitions. Use the button above to return to the yarn section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

