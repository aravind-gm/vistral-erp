"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewSupplierPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Add Supplier</h1>
          <p className="text-sm text-[#6B7280] mt-1">Add a new supplier to your material network.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/suppliers") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Suppliers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            This placeholder page is ready for the supplier creation form.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
