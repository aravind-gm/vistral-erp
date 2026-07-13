"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Factory, Layers } from "lucide-react";
import { formatDate } from "@/features/dashboard/utils/formatters";

const BATCH_STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  ON_HOLD: "destructive",
};

export default function ProductionPage() {
  const [tab, setTab] = useState("batches");
  const [page, setPage] = useState(1);

  const batches = api.production.listBatches.useQuery({ page, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="text-sm text-gray-500 mt-1">Track batches through the production floor</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        {["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].map((status) => {
          const count = batches.data?.data.filter(
            (b: { status: string }) => b.status === status
          ).length ?? 0;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 capitalize">{status.toLowerCase()}</p>
                <p className="text-3xl font-bold font-mono mt-1">{count}</p>
                <p className="text-xs text-gray-400 mt-1">batches</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="batches">All Batches</TabsTrigger>
          <TabsTrigger value="floor">Status View</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Batches</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {batches.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : !batches.data?.data.length ? (
                <div className="p-12 text-center text-gray-400">
                  <Factory className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No production batches</p>
                  <p className="text-sm mt-1">Create a batch from an approved order</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Batch No.</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Order No.</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Style</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Customer</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Created</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {batches.data.data.map((batch: typeof batches.data.data[number]) => (
                        <tr key={batch.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 font-mono font-medium">{batch.batchNo}</td>
                          <td className="px-6 py-4 text-gray-600">{batch.order?.orderNo ?? "-"}</td>
                          <td className="px-6 py-4 text-gray-600">{batch.order?.styleName ?? "-"}</td>
                          <td className="px-6 py-4 text-right font-mono">{batch.order?.customer?.name ?? "-"}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(batch.createdAt)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={BATCH_STATUS_VARIANT[batch.status] ?? "secondary"}>
                              {batch.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batches.data.meta.total > 20 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, batches.data.meta.total)} of {batches.data.meta.total}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page * 20 >= batches.data.meta.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floor" className="mt-4">
          <div className="grid grid-cols-4 gap-4">
            {["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].map((stage) => (
              <Card key={stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {stage}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {batches.data?.data
                    .filter((b: { status: string }) => b.status === stage)
                    .map((batch: typeof batches.data.data[number]) => (
                      <div key={batch.id} className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-mono font-semibold">{batch.batchNo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{batch.order?.orderNo ?? "-"}</p>
                      </div>
                    )) ?? null}
                  {!batches.data?.data.filter((b: { status: string }) => b.status === stage).length && (
                    <p className="text-xs text-gray-400 text-center py-4">Empty</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
