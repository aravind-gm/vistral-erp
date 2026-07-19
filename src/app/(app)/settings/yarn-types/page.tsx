"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const yarnTypes = api.yarn.listTypes.useQuery();

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
        <CardContent className="p-0">
          {yarnTypes.isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !yarnTypes.data?.length ? (
            <div className="p-8 text-center text-sm text-[#4B5563]">
              <p className="font-medium text-[#111827]">No yarn types found</p>
              <p className="mt-2">Yarn types are not yet configured. Create them from the yarn page or add a new type here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Count</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Composition</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Unit</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {yarnTypes.data.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                      <td className="px-6 py-4 text-gray-600">{type.count}</td>
                      <td className="px-6 py-4 text-gray-600">{type.composition ?? "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{type.unit}</td>
                      <td className="px-6 py-4">
                        <Badge variant={type.isActive ? "success" : "secondary"}>
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

