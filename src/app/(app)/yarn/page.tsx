"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, AlertCircle, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/features/dashboard/utils/formatters";

export default function YarnPage() {
  const router = useRouter();
  const [tab, setTab] = useState("inventory");
  const [yarnTypeSearch, setYarnTypeSearch] = useState("");

  const inventory = api.yarn.getInventory.useQuery();
  const yarnTypes = api.yarn.listTypes.useQuery(yarnTypeSearch ? { search: yarnTypeSearch } : undefined);
  const procurements = api.yarn.listProcurements.useQuery({ page: 1, limit: 20 });
  const noYarnTypes = yarnTypes.data?.length === 0;
  const noProcurements = procurements.data?.data.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yarn Management</h1>
          <p className="text-sm text-gray-500 mt-1">Inventory, procurement and yarn types</p>
        </div>
        <Button onClick={() => router.push("/yarn/procurement/new") }>
          <Plus className="h-4 w-4 mr-2" />
          New Procurement
        </Button>
      </div>

      {/* Inventory Summary */}
      {inventory.data && (
        <div className="grid grid-cols-4 gap-4">
          {inventory.data.map((item: typeof inventory.data[number]) => (
            <Card key={item.yarnTypeId}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.yarnType?.name ?? "Unknown"}</p>
                            <p className="text-2xl font-bold font-mono mt-1">
                      {Number(item.currentStock).toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                    </p>
                  </div>
                  {Number(item.currentStock) < Number(item.reorderLevel) ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Reorder: {Number(item.reorderLevel).toFixed(0)} kg</span>
                  <Badge
                    variant={Number(item.currentStock) < Number(item.reorderLevel) ? "destructive" : "success"}
                    className="text-xs"
                  >
                    {Number(item.currentStock) < Number(item.reorderLevel) ? "Low" : "OK"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="types">Yarn Types</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {inventory.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Yarn Type</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Current Stock</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Reserved</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Available</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Unit</th>
                      <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inventory.data?.map((item: typeof inventory.data[number]) => {
                      const isLow = Number(item.currentStock) < Number(item.reorderLevel);
                      return (
                        <tr key={item.yarnTypeId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{item.yarnType?.name ?? "-"}</td>
                          <td className="px-6 py-4 text-right font-mono">{Number(item.currentStock).toFixed(2)} kg</td>
                          <td className="px-6 py-4 text-right font-mono text-amber-600">{Number(item.reservedStock).toFixed(2)} kg</td>
                          <td className="px-6 py-4 text-right font-mono text-green-600">{Number(item.availableStock).toFixed(2)} kg</td>
                          <td className="px-6 py-4 text-right font-mono">-</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={isLow ? "destructive" : "success"}>
                              {isLow ? "Low Stock" : "Adequate"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Procurement Orders</CardTitle>
              <Button size="sm" onClick={() => router.push("/yarn/procurement/new") }>
                <Plus className="h-4 w-4 mr-1" /> New PO
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {procurements.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : !procurements.data?.data.length ? (
                <div className="p-12 text-center text-gray-400">
                  <TrendingDown className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>No procurement orders yet</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push("/yarn/procurement/new")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Create first procurement
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium text-gray-600">PO Number</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Supplier</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Amount</th>
                      <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {procurements.data.data.map((po: typeof procurements.data.data[number]) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium font-mono">{po.poNo}</td>
                        <td className="px-6 py-4">{po.supplier?.name ?? "-"}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(po.poDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(Number(po.totalAmount))}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={
                            po.status === "RECEIVED" ? "success" :
                            po.status === "ORDERED" ? "warning" : "secondary"
                          }>
                            {po.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Yarn Types</CardTitle>
                <Input
                  placeholder="Search types..."
                  value={yarnTypeSearch}
                  onChange={(e) => setYarnTypeSearch(e.target.value)}
                  className="w-48 h-8"
                />
              </div>
              <Button size="sm" onClick={() => router.push("/settings/yarn-types") }>
                <Plus className="h-4 w-4 mr-1" /> Add Type
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {yarnTypes.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : noYarnTypes ? (
                <div className="p-12 text-center text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>No yarn types yet</p>
                  <Button size="sm" className="mt-4" onClick={() => router.push("/settings/yarn-types") }>
                    <Plus className="h-4 w-4 mr-1" /> Add Yarn Type
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Name</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Count</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Composition</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">Std. Price/kg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {yarnTypes.data?.map((yt: typeof yarnTypes.data[number]) => (
                      <tr key={yt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{yt.name}</td>
                        <td className="px-6 py-4 text-gray-600">{yt.count ?? "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{yt.composition ?? "-"}</td>
                        <td className="px-6 py-4 text-right">{yt.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
