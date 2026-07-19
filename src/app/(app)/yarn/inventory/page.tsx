"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, History, AlertTriangle, Package, Warehouse, Layers } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/dashboard/utils/formatters";

export default function YarnInventoryPage() {
  const router = useRouter();
  const inventory = api.yarn.getInventory.useQuery();
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  const selectedStock = inventory.data?.find((stock) => stock.id === selectedStockId);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Yarn Inventory</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review stock levels, reserved balances, reorder levels, and audit logs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/yarn")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={() => router.push("/yarn/inventory/new")}>
            <Plus className="h-4 w-4 mr-2" /> Receive Yarn Stock
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Stock List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Yarn Stock Levels</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {inventory.isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !inventory.data?.length ? (
              <div className="p-12 text-center text-gray-400">
                <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Inventory is empty</p>
                <p className="text-sm mt-1">Log a yarn receipt to populate stock levels</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                      <th className="text-left px-4 py-3 font-semibold">Yarn Type</th>
                      <th className="text-left px-4 py-3 font-semibold">Lot No</th>
                      <th className="text-right px-4 py-3 font-semibold">On Hand</th>
                      <th className="text-right px-4 py-3 font-semibold">Reserved</th>
                      <th className="text-right px-4 py-3 font-semibold">Available</th>
                      <th className="text-center px-4 py-3 font-semibold">Alerts</th>
                      <th className="text-center px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inventory.data.map((stock) => {
                      const isLowStock = Number(stock.availableStock) <= Number(stock.reorderLevel);
                      return (
                        <tr
                          key={stock.id}
                          onClick={() => setSelectedStockId(stock.id)}
                          className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors ${selectedStockId === stock.id ? "bg-slate-50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-semibold block text-gray-900">{stock.yarnType.name}</span>
                            <span className="text-xs text-gray-400 font-mono block">Code: {stock.yarnType.code} &bull; Count: {stock.yarnType.count}</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-gray-600">{stock.lotNo || "-"}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">{Number(stock.currentStock).toFixed(2)} KG</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-500">{Number(stock.reservedStock).toFixed(2)} KG</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">{Number(stock.availableStock).toFixed(2)} KG</td>
                          <td className="px-4 py-3 text-center">
                            {isLowStock ? (
                              <Badge variant="destructive" className="inline-flex gap-1 items-center">
                                <AlertTriangle className="h-3 w-3" /> Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success">Healthy</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="ghost">View Audits</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit / Transaction Log Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              Stock Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedStockId ? (
              <div className="py-20 text-center text-gray-400">
                <Warehouse className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a yarn stock row to inspect recent audits and transaction logs.</p>
              </div>
            ) : !selectedStock ? (
              <p className="text-sm text-red-500">Stock record not found.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedStock.yarnType.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Lot No: {selectedStock.lotNo || "-"}</p>
                  <p className="text-xs text-gray-500">Warehouse Loc: {selectedStock.location || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-400 block">Reorder Limit</span>
                    <span className="font-bold text-gray-800 font-mono text-sm">{Number(selectedStock.reorderLevel).toFixed(2)} KG</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-400 block">Warehouse Loc</span>
                    <span className="font-bold text-gray-800 text-xs">{selectedStock.location || "Default shelf"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recent Transactions</h4>
                  <div className="space-y-3 font-mono text-xs">
                    {selectedStock.transactions?.map((tx: any) => (
                      <div key={tx.id} className="border-l-2 border-slate-200 pl-3 py-1 space-y-1 relative">
                        <div className="flex justify-between items-center">
                          <Badge variant={tx.type === "RECEIPT" ? "success" : "default"}>{tx.type}</Badge>
                          <span className="text-gray-400 text-[10px]">{formatDate(tx.createdAt)}</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{tx.type === "RECEIPT" ? "+" : "-"}{Number(tx.quantity).toFixed(2)} KG</p>
                        <p className="text-[10px] text-gray-400">Balance: {Number(tx.balanceAfter).toFixed(2)} KG</p>
                        {tx.remarks && <p className="text-[10px] text-gray-500 italic mt-0.5 font-sans">&ldquo;{tx.remarks}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
