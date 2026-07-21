"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Import, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const procurementSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  expectedDate: z.date().optional(),
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      yarnTypeId: z.string().min(1, "Yarn type is required"),
      quantity: z.number().min(0.001, "Quantity required"),
      unit: z.string().default("KG"),
      unitPrice: z.number().min(0, "Unit price required"),
      amount: z.number().min(0),
      hsn: z.string().optional(),
      gstPercent: z.number().min(0).max(100).default(5),
    })
  ).min(1, "Add at least one procurement item"),
});

type ProcurementForm = z.infer<typeof procurementSchema>;

export default function NewProcurementPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: suppliers } = api.suppliers.list.useQuery({ page: 1, limit: 100 });
  const { data: yarnTypes } = api.yarn.listTypes.useQuery();
  const { data: ordersWithCosting, isLoading: loadingOrders } = api.orders.listWithCosting.useQuery();
  
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Supplier Quick Add States
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierCity, setSupplierCity] = useState("");
  const [supplierState, setSupplierState] = useState("");
  const [supplierPincode, setSupplierPincode] = useState("");
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const noSuppliers = suppliers?.data.length === 0;
  const noYarnTypes = yarnTypes?.length === 0;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcurementForm>({
    resolver: zodResolver(procurementSchema) as Resolver<ProcurementForm>,
    defaultValues: {
      supplierId: "",
      expectedDate: undefined,
      remarks: "",
      items: [{ yarnTypeId: "", quantity: 0.1, unit: "KG", unitPrice: 0, amount: 0, hsn: "", gstPercent: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const createProcurement = api.yarn.createProcurement.useMutation({
    onSuccess: () => {
      toast.success("Procurement order created successfully");
      router.push("/yarn/procurement");
    },
    onError: (error) => toast.error(error.message),
  });

  const createSupplier = api.suppliers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Supplier added successfully");
      setValue("supplierId", data.id);
      setSupplierDialogOpen(false);
      setSupplierName("");
      setSupplierPhone("");
      setSupplierEmail("");
      setSupplierContact("");
      setSupplierAddress("");
      setSupplierCity("");
      setSupplierState("");
      setSupplierPincode("");
      void utils.suppliers.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create supplier");
    }
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    if (supplierPhone.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return;
    }
    if (!supplierAddress.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!supplierCity.trim()) {
      toast.error("City is required");
      return;
    }
    if (!supplierState.trim()) {
      toast.error("State is required");
      return;
    }
    if (supplierPincode.length < 6) {
      toast.error("Pincode must be at least 6 digits");
      return;
    }

    createSupplier.mutate({
      name: supplierName,
      phone: supplierPhone,
      email: supplierEmail || undefined,
      contactPerson: supplierContact || undefined,
      addressLine1: supplierAddress,
      city: supplierCity,
      state: supplierState,
      pincode: supplierPincode,
      supplierType: "YARN",
    });
  };

  const onSubmit = (data: ProcurementForm) => {
    createProcurement.mutate({
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
    });
  };

  const handleImportFabric = (fabric: any, orderItem: any) => {
    const consumption = parseFloat(fabric.consumption) || 0;
    const lossPercent = parseFloat(fabric.lossPercent) || 0;
    const yarnRate = parseFloat(fabric.yarnRate) || 0;

    const itemIds = fabric.itemIds || [];
    const hasMapping = itemIds.length > 0;
    const targetQty = hasMapping && orderItem.orderDetails
      ? orderItem.orderDetails
          .filter((d: any) => itemIds.includes(d.id))
          .reduce((sum: number, d: any) => sum + d.quantity, 0)
      : (orderItem.quantity || 1);

    const netReq = consumption * targetQty;
    const grossReq = netReq * (1 + lossPercent / 100);
    const amount = grossReq * yarnRate;

    // Try to auto-match matching yarnTypeId by name count
    const matchedYarn = yarnTypes?.find((y) => 
      y.name.toLowerCase().includes(fabric.name.toLowerCase()) ||
      fabric.name.toLowerCase().includes(y.name.toLowerCase())
    );

    append({
      yarnTypeId: matchedYarn?.id ?? "",
      quantity: Number(grossReq.toFixed(3)),
      unit: "KG",
      unitPrice: yarnRate,
      amount: Number(amount.toFixed(2)),
      hsn: "",
      gstPercent: 5,
    });

    toast.success(`Imported ${fabric.name} for Order ${orderItem.orderNo} (${grossReq.toFixed(1)} Kg)`);
  };

  const handleImportAllForOrder = (orderItem: any) => {
    const details = orderItem.orderCosting?.costingDetails as any;
    if (!details || !details.fabrics || details.fabrics.length === 0) {
      toast.error("No fabrics found in this order costing");
      return;
    }

    details.fabrics.forEach((f: any) => {
      handleImportFabric(f, orderItem);
    });
  };

  return (
    <div className="space-y-6 pt-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">New Yarn Procurement PO</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create a purchase order for yarn by drafting manually or importing order requirements.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/yarn/procurement") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Procurement Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Purchase Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Supplier / Yarn Mill *</Label>
                  <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:no-underline flex items-center gap-0.5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Supplier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                      <DialogHeader>
                        <DialogTitle>Quick Add Supplier</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddSupplier} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Supplier Name *</Label>
                            <Input
                              value={supplierName}
                              onChange={(e) => setSupplierName(e.target.value)}
                              placeholder="e.g. Acme Spinning Mills"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Phone Number *</Label>
                            <Input
                              value={supplierPhone}
                              onChange={(e) => setSupplierPhone(e.target.value)}
                              placeholder="10-digit mobile/tel"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Email Address</Label>
                            <Input
                              type="email"
                              value={supplierEmail}
                              onChange={(e) => setSupplierEmail(e.target.value)}
                              placeholder="name@company.com"
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Contact Person</Label>
                            <Input
                              value={supplierContact}
                              onChange={(e) => setSupplierContact(e.target.value)}
                              placeholder="Name of contact person"
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Address Line 1 *</Label>
                            <Input
                              value={supplierAddress}
                              onChange={(e) => setSupplierAddress(e.target.value)}
                              placeholder="Street address, factory unit"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">City *</Label>
                            <Input
                              value={supplierCity}
                              onChange={(e) => setSupplierCity(e.target.value)}
                              placeholder="City"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">State *</Label>
                            <Input
                              value={supplierState}
                              onChange={(e) => setSupplierState(e.target.value)}
                              placeholder="State"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pincode *</Label>
                            <Input
                              value={supplierPincode}
                              onChange={(e) => setSupplierPincode(e.target.value)}
                              placeholder="6-digit ZIP code"
                              className="h-9 text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Country</Label>
                            <Input
                              value="India"
                              disabled
                              className="h-9 text-xs bg-gray-50"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSupplierDialogOpen(false)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            loading={createSupplier.isPending}
                            className="bg-[#111827] hover:bg-black text-white text-xs"
                          >
                            Save Supplier
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {noSuppliers ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-[#FAFAFA] p-4 text-sm text-gray-600">
                    <p>No suppliers available yet.</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push("/suppliers/new")}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Supplier
                    </Button>
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="supplierId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers?.data.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name} ({supplier.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.supplierId && <p className="text-xs text-red-500">{errors.supplierId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Controller
                  control={control}
                  name="expectedDate"
                  render={({ field }) => (
                    <Input
                      type="date"
                      className="h-9"
                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label>Remarks</Label>
                <Textarea {...register("remarks")} rows={3} placeholder="Optional notes, shipment terms, count specifications..." className="text-sm" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold">PO Material Items</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ yarnTypeId: "", quantity: 0.1, unit: "KG", unitPrice: 0, amount: 0, hsn: "", gstPercent: 5 })}
                disabled={noYarnTypes}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Manual Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {noYarnTypes ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-[#FAFAFA] p-8 text-center text-sm text-gray-600">
                  <p>No yarn types available. Setup yarn types first.</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push("/settings/yarn-types")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Yarn Type
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 md:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.8fr_auto] items-end border border-gray-100 p-3 rounded-lg bg-gray-50/50">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 font-medium">Yarn Type / Count *</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.yarnTypeId` as const}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-8 bg-white">
                                <SelectValue placeholder="Select yarn type" />
                              </SelectTrigger>
                              <SelectContent>
                                {yarnTypes?.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name} {type.count ? `(${type.count})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 font-medium">Qty (Kg)</Label>
                        <Input
                          type="number"
                          step="any"
                          className="h-8 bg-white text-center"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: (event) => {
                              const qty = parseFloat(event.target.value) || 0;
                              const rate = watch(`items.${index}.unitPrice`) || 0;
                              setValue(`items.${index}.amount`, Number((qty * rate).toFixed(2)));
                            },
                          })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 font-medium">Rate / Kg (₹)</Label>
                        <Input
                          type="number"
                          step="any"
                          className="h-8 bg-white text-right"
                          {...register(`items.${index}.unitPrice`, {
                            valueAsNumber: true,
                            onChange: (event) => {
                              const rate = parseFloat(event.target.value) || 0;
                              const qty = watch(`items.${index}.quantity`) || 0;
                              setValue(`items.${index}.amount`, Number((qty * rate).toFixed(2)));
                            },
                          })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 font-medium">Amount (₹)</Label>
                        <Input
                          type="number"
                          step="any"
                          className="h-8 bg-white text-right"
                          {...register(`items.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 font-medium">GST %</Label>
                        <Input
                          type="number"
                          className="h-8 bg-white text-center"
                          {...register(`items.${index}.gstPercent`, { valueAsNumber: true })}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.push("/yarn/procurement")}>Cancel</Button>
            <Button type="submit" loading={createProcurement.isPending} className="bg-[#111827] hover:bg-black text-white px-6">
              Create PO & Procurement
            </Button>
          </div>
        </form>

        {/* Right Side: Order Requirements Planner */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200 bg-white sticky top-4 shadow-sm">
            <CardHeader className="bg-gray-50/70 border-b border-gray-200/50 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-gray-700" />
                <CardTitle className="text-base font-semibold text-gray-800">Order Costings Planner</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">Select an active order style to instantly import calculated yarn requirements.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[680px] overflow-y-auto">
              {loadingOrders ? (
                <div className="space-y-3 pt-2">
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                </div>
              ) : !ordersWithCosting || ordersWithCosting.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No active orders with completed costing sheets found.
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersWithCosting.map((orderItem) => {
                    const costingDetails = orderItem.orderCosting?.costingDetails as any;
                    const fabrics = costingDetails?.fabrics || [];
                    const isExpanded = expandedOrder === orderItem.id;

                    return (
                      <div key={orderItem.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-150 bg-white shadow-sm">
                        {/* Accordion Trigger */}
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-50/75 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          onClick={() => setExpandedOrder(isExpanded ? null : orderItem.id)}
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-900">Order {orderItem.orderNo}</p>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase">{orderItem.styleName ?? "-"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                              {orderItem.quantity} pcs
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <div className="p-3 bg-white space-y-3">
                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold border-b pb-1.5">
                              <span>Fabric Requirement</span>
                              <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                onClick={() => handleImportAllForOrder(orderItem)}
                                className="h-5 px-1.5 text-[9px] font-bold border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-0.5"
                              >
                                <Import className="h-3 w-3" /> Add All ({fabrics.length})
                              </Button>
                            </div>

                            {fabrics.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center py-2">No fabric entries in this costing sheet.</p>
                            ) : (
                              <div className="space-y-2">
                                {fabrics.map((f: any) => {
                                  const itemIds = f.itemIds || [];
                                  const hasMapping = itemIds.length > 0;
                                  const targetPcs = hasMapping && orderItem.orderDetails
                                    ? orderItem.orderDetails
                                        .filter((d: any) => itemIds.includes(d.id))
                                        .reduce((sum: number, d: any) => sum + d.quantity, 0)
                                    : (orderItem.quantity || 0);

                                  const consumption = parseFloat(f.consumption) || 0;
                                  const lossPercent = parseFloat(f.lossPercent) || 0;
                                  const grossReq = consumption * targetPcs * (1 + lossPercent / 100);

                                  return (
                                    <div key={f.id} className="flex justify-between items-center p-2 rounded border border-gray-100 bg-gray-50/30">
                                      <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-gray-800">{f.name}</p>
                                        <p className="text-[9px] text-gray-500">
                                          ₹{f.yarnRate}/Kg • Weight: {f.consumption} Kg • Loss: {f.lossPercent}%
                                          {hasMapping ? ` • ${targetPcs} pcs` : ` • All (${orderItem.quantity} pcs)`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-gray-900 bg-yellow-50 text-yellow-800 border border-yellow-100 px-1.5 py-0.5 rounded">
                                          {grossReq.toFixed(2)} Kg
                                        </span>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleImportFabric(f, orderItem)}
                                          className="h-6 w-6 text-green-600 hover:text-green-800 hover:bg-green-50"
                                          title="Import Fabric to Items"
                                        >
                                          <Import className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
