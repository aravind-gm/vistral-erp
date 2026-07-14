"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  hsn: z.string().optional(),
  quantity: z.number().min(1, "Quantity required"),
  unit: z.string().default("PCS"),
  unitPrice: z.number().min(0, "Unit price required"),
  amount: z.number().min(0),
  gstPercent: z.number().min(0).max(100).default(5),
  cgstAmount: z.number().min(0).default(0),
  sgstAmount: z.number().min(0).default(0),
  igstAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
});

const invoiceFormSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  gstType: z.enum(["CGST_SGST", "IGST"]).default("CGST_SGST"),
  discountAmount: z.number().min(0).default(0),
  remarks: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
});

type InvoiceForm = z.infer<typeof invoiceFormSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: customers } = api.customers.list.useQuery({ page: 1, limit: 100 });
  const { data: orders } = api.orders.list.useQuery({ page: 1, limit: 100 });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      orderId: "",
      customerId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      gstType: "CGST_SGST",
      discountAmount: 0,
      remarks: "",
      items: [
        {
          description: "",
          hsn: "",
          quantity: 1,
          unit: "PCS",
          unitPrice: 0,
          amount: 0,
          gstPercent: 5,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const formValues = watch();

  const createInvoice = api.finance.createInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice created");
      router.push("/finance/invoices");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const calculateTotals = () => {
    const subtotal = formValues.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) ?? 0;
    const discount = Number(formValues.discountAmount || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const totalTax = formValues.items?.reduce((sum, item) => {
      const itemAmount = Number(item.amount || 0);
      const gstPercent = Number(item.gstPercent || 0);
      return sum + (itemAmount * gstPercent) / 100;
    }, 0) ?? 0;
    const taxBreakdown = formValues.gstType === "IGST"
      ? { cgst: 0, sgst: 0, igst: totalTax }
      : { cgst: totalTax / 2, sgst: totalTax / 2, igst: 0 };
    return {
      subtotal,
      discount,
      taxableAmount,
      totalTax,
      ...taxBreakdown,
      totalAmount: taxableAmount + totalTax,
    };
  };

  const totals = calculateTotals();

  const onSubmit = (data: InvoiceForm) => {
    const items = data.items.map((item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      const taxValue = (amount * Number(item.gstPercent || 0)) / 100;
      const cgstAmount = data.gstType === "CGST_SGST" ? taxValue / 2 : 0;
      const sgstAmount = data.gstType === "CGST_SGST" ? taxValue / 2 : 0;
      const igstAmount = data.gstType === "IGST" ? taxValue : 0;
      return {
        ...item,
        amount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount: amount + taxValue,
      };
    });

    createInvoice.mutate({
      orderId: data.orderId || undefined,
      customerId: data.customerId,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      gstType: data.gstType,
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalAmount: totals.totalAmount,
      remarks: data.remarks,
      items,
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">New Invoice</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create a sales invoice for shipped orders.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/finance") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Finance
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select value={formValues.customerId} onValueChange={(value) => setValue("customerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.data.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Order</Label>
              <Select value={formValues.orderId || ""} onValueChange={(value) => setValue("orderId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No order</SelectItem>
                  {orders?.data.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNo} — {order.customer?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Invoice date *</Label>
              <Input type="date" {...register("invoiceDate")} />
              {errors.invoiceDate && <p className="text-xs text-red-500">{errors.invoiceDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" {...register("dueDate")} />
            </div>

            <div className="space-y-1.5">
              <Label>GST type</Label>
              <Select value={formValues.gstType} onValueChange={(value) => setValue("gstType", value as "CGST_SGST" | "IGST")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CGST_SGST">CGST + SGST</SelectItem>
                  <SelectItem value="IGST">IGST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Discount</Label>
              <Input type="number" step="0.01" {...register("discountAmount", { valueAsNumber: true })} />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Invoice items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({
              description: "",
              hsn: "",
              quantity: 1,
              unit: "PCS",
              unitPrice: 0,
              amount: 0,
              gstPercent: 5,
              cgstAmount: 0,
              sgstAmount: 0,
              igstAmount: 0,
              totalAmount: 0,
            })}>
              <Plus className="h-4 w-4 mr-1" /> Add item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-6 items-end">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Description *</Label>
                  <Input {...register(`items.${index}.description` as const)} />
                </div>
                <div className="space-y-1.5">
                  <Label>HSN</Label>
                  <Input {...register(`items.${index}.hsn` as const)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Qty *</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit price *</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  <Input type="number" step="0.1" {...register(`items.${index}.gstPercent` as const, { valueAsNumber: true })} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-xl font-semibold">₹{totals.subtotal.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Taxable amount</p>
                <p className="text-xl font-semibold">₹{totals.taxableAmount.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total tax</p>
                <p className="text-xl font-semibold">₹{totals.totalTax.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total invoice amount</p>
                <p className="text-xl font-semibold">₹{totals.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/finance")}>Cancel</Button>
          <Button type="submit" loading={createInvoice.isPending}>Create Invoice</Button>
        </div>
      </form>
    </div>
  );
}
