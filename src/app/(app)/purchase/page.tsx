"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText, Calendar, IndianRupee, Trash2, CheckCircle2, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/dashboard/utils/formatters";

type POItemInput = {
  itemName: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstPercent: number;
};

const PO_STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "destructive"> = {
  DRAFT: "default",
  APPROVED: "warning",
  RECEIVED: "success",
  CANCELLED: "destructive",
};

export default function PurchasePage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

  const purchaseOrders = api.purchase.list.useQuery({ page, limit: 20 });
  const suppliers = api.suppliers.list.useQuery({ page: 1, limit: 100 });
  const selectedPO = api.purchase.byId.useQuery({ id: selectedPOId ?? "" }, { enabled: Boolean(selectedPOId) });

  const createPO = api.purchase.create.useMutation({
    onSuccess: () => {
      toast.success("Purchase Order created successfully");
      setIsCreateOpen(false);
      void utils.purchase.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = api.purchase.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Purchase Order status updated");
      void utils.purchase.list.invalidate();
      if (selectedPOId) {
        void utils.purchase.byId.invalidate({ id: selectedPOId });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  // Create Form State
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<POItemInput[]>([
    { itemName: "", itemCode: "", description: "", quantity: 1, unit: "PCS", unitPrice: 0, gstPercent: 18 },
  ]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.gstPercent / 100), 0);
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [items]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemName: "", itemCode: "", description: "", quantity: 1, unit: "PCS", unitPrice: 0, gstPercent: 18 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof POItemInput, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    const invalidItem = items.some((item) => !item.itemName || item.quantity <= 0 || item.unitPrice < 0);
    if (invalidItem) {
      toast.error("Please fill in all item names, positive quantities and prices");
      return;
    }

    createPO.mutate({
      supplierId,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      remarks,
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Purchase Orders</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create, approve and receive material procurement orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/suppliers")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Suppliers
          </Button>
          <Button onClick={() => {
            setSupplierId("");
            setExpectedDate("");
            setRemarks("");
            setItems([{ itemName: "", itemCode: "", description: "", quantity: 1, unit: "PCS", unitPrice: 0, gstPercent: 18 }]);
            setIsCreateOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> New Purchase Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Material Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {purchaseOrders.isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !purchaseOrders.data?.data.length ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No purchase orders found</p>
              <p className="text-sm mt-1">Click "New Purchase Order" to procure materials or accessories</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">PO No</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Supplier</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">PO Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Expected Date</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-600">Total Value</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchaseOrders.data.data.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-medium">{po.poNo}</td>
                      <td className="px-6 py-4">{po.supplier.name}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(po.poDate)}</td>
                      <td className="px-6 py-4 text-gray-500">{po.expectedDate ? formatDate(po.expectedDate) : "-"}</td>
                      <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(Number(po.totalAmount))}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={PO_STATUS_VARIANT[po.status] ?? "default"}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPOId(po.id)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {purchaseOrders.data.meta.total > 20 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, purchaseOrders.data.meta.total)} of {purchaseOrders.data.meta.total}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page * 20 >= purchaseOrders.data.meta.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* CREATE PO DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for materials, fabrics, trim or other accessories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.data?.data?.map((supp: any) => (
                      <SelectItem key={supp.id} value={supp.id}>{supp.name} ({supp.supplierType})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">PO Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-12 items-end border-b border-gray-100 pb-4">
                  <div className="md:col-span-3 space-y-1.5">
                    <Label>Item Name *</Label>
                    <Input value={item.itemName} onChange={(e) => handleUpdateItem(index, "itemName", e.target.value)} placeholder="e.g. Cotton fabric" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Code</Label>
                    <Input value={item.itemCode} onChange={(e) => handleUpdateItem(index, "itemCode", e.target.value)} placeholder="Part #" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Qty *</Label>
                    <Input type="number" step="0.01" value={item.quantity} onChange={(e) => handleUpdateItem(index, "quantity", Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-1 space-y-1.5">
                    <Label>Unit</Label>
                    <Select value={item.unit} onValueChange={(val) => handleUpdateItem(index, "unit", val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCS">PCS</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="METERS">MTR</SelectItem>
                        <SelectItem value="ROLLS">ROLLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Price *</Label>
                    <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleUpdateItem(index, "unitPrice", Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-1 space-y-1.5">
                    <Label>GST %</Label>
                    <Input type="number" step="0.1" value={item.gstPercent} onChange={(e) => handleUpdateItem(index, "gstPercent", Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-1 flex justify-center pb-1">
                    <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Remarks / Instructions</Label>
              <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>

            <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-3 text-sm">
              <div>
                <p className="text-gray-500">Subtotal</p>
                <p className="text-lg font-bold font-mono">{formatCurrency(totals.subtotal)}</p>
              </div>
              <div>
                <p className="text-gray-500">Estimated Tax (GST)</p>
                <p className="text-lg font-bold font-mono">{formatCurrency(totals.tax)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Estimated PO Amount</p>
                <p className="text-lg font-bold font-mono text-green-700">{formatCurrency(totals.total)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createPO.isPending}>Save Draft PO</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={Boolean(selectedPOId)} onOpenChange={(open) => { if (!open) setSelectedPOId(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedPO.isLoading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !selectedPO.data ? (
            <p>PO Details not found.</p>
          ) : (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center mr-6">
                  <DialogTitle className="text-xl font-mono">PO: {selectedPO.data.poNo}</DialogTitle>
                  <Badge variant={PO_STATUS_VARIANT[selectedPO.data.status] ?? "default"}>
                    {selectedPO.data.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Review items, prices, and status updates for this purchase order.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-500 block">Supplier</span>
                    <span className="font-semibold text-gray-900">{selectedPO.data.supplier.name}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">{selectedPO.data.supplier.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Dates</span>
                    <span className="text-gray-900 block">PO Date: {formatDate(selectedPO.data.poDate)}</span>
                    <span className="text-gray-900 block">Expected: {selectedPO.data.expectedDate ? formatDate(selectedPO.data.expectedDate) : "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Purchase Order Items</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50 text-gray-600">
                        <th className="text-left py-2 px-3 font-semibold">Item</th>
                        <th className="text-left py-2 px-3 font-semibold">Code</th>
                        <th className="text-right py-2 px-3 font-semibold">Qty</th>
                        <th className="text-right py-2 px-3 font-semibold">Unit Price</th>
                        <th className="text-right py-2 px-3 font-semibold">Tax</th>
                        <th className="text-right py-2 px-3 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      {selectedPO.data.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-sans text-gray-900">{item.itemName}</td>
                          <td className="py-2 px-3 text-gray-500">{item.itemCode || "-"}</td>
                          <td className="py-2 px-3 text-right">{Number(item.quantity)} {item.unit}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                          <td className="py-2 px-3 text-right">{Number(item.gstPercent)}%</td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatCurrency(Number(item.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedPO.data.remarks && (
                  <div>
                    <span className="text-gray-500 text-sm block">Remarks</span>
                    <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedPO.data.remarks}</p>
                  </div>
                )}

                <div className="flex justify-end p-4 rounded-xl border border-green-100 bg-green-50 text-sm">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-700" />
                    <div>
                      <span className="text-green-800 text-xs block font-sans">Total PO Value (Excl Tax)</span>
                      <span className="text-green-900 text-lg font-bold font-mono">{formatCurrency(Number(selectedPO.data.totalAmount))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex gap-2">
                    {selectedPO.data.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: selectedPO.data!.id, status: "APPROVED" })}
                        loading={updateStatus.isPending}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve PO
                      </Button>
                    )}
                    {selectedPO.data.status === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: selectedPO.data!.id, status: "RECEIVED" })}
                        loading={updateStatus.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Received
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedPOId(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
