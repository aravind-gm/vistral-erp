"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/features/dashboard/utils/formatters";

type POItemInput = {
  itemName: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstPercent: number;
};

export default function NewPurchasePage() {
  const router = useRouter();
  const utils = api.useUtils();

  const suppliers = api.suppliers.list.useQuery({ page: 1, limit: 100 });

  const createPO = api.purchase.create.useMutation({
    onSuccess: () => {
      toast.success("Purchase Order created successfully");
      void utils.purchase.list.invalidate();
      router.push("/purchase");
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
    <div className="space-y-6 pt-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">New Material Purchase Order</h1>
          <p className="text-sm text-[#6B7280] mt-1">Draft a purchase order for fabrics, accessories, or other operational materials.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/purchase")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Form Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Purchase Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Supplier / Vendor *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.data?.data.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.supplierType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="h-10 text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold">PO Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid gap-3 grid-cols-12 items-end border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="col-span-12 md:col-span-3 space-y-1.5">
                    <Label className="text-xs">Item Name *</Label>
                    <Input value={item.itemName} onChange={(e) => handleUpdateItem(index, "itemName", e.target.value)} placeholder="e.g. Cotton fabric" className="h-9 text-xs" />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Code</Label>
                    <Input value={item.itemCode} onChange={(e) => handleUpdateItem(index, "itemCode", e.target.value)} placeholder="Part #" className="h-9 text-xs" />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Qty *</Label>
                    <Input type="number" step="0.01" value={item.quantity || ""} onChange={(e) => handleUpdateItem(index, "quantity", Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Unit</Label>
                    <Select value={item.unit} onValueChange={(val) => handleUpdateItem(index, "unit", val)}>
                      <SelectTrigger className="h-9 text-xs">
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
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Price *</Label>
                    <Input type="number" step="0.01" value={item.unitPrice || ""} onChange={(e) => handleUpdateItem(index, "unitPrice", Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                  <div className="col-span-10 md:col-span-1 space-y-1.5">
                    <Label className="text-xs">GST %</Label>
                    <Input type="number" step="0.1" value={item.gstPercent} onChange={(e) => handleUpdateItem(index, "gstPercent", Number(e.target.value))} className="h-9 text-xs" />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-center pb-1">
                    <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => handleRemoveItem(index)} className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Remarks / Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Type optional terms, notes, or receipt instructions..." className="text-xs" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: PO Costing Summary */}
        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm sticky top-6">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-[#111827]">Order Costing Summary</CardTitle>
              <CardDescription>Estimated PO tax breakdowns</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">Estimated GST</span>
                <span className="font-semibold text-gray-900 font-mono">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-base font-bold">
                <span className="text-gray-900">Total Est. Amount</span>
                <span className="text-green-700 font-mono">{formatCurrency(totals.total)}</span>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-[#111827] hover:bg-black text-white py-2 text-xs font-semibold"
                  disabled={createPO.isPending}
                >
                  {createPO.isPending ? "Saving..." : "Save Draft PO"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
