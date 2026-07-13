"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import type { Resolver } from "react-hook-form";

const detailSchema = z.object({
  color: z.string().min(1, "Color required"),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  composition: z.string().optional(),
  remarks: z.string().optional(),
});

const orderSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
  buyerOrderNo: z.string().optional(),
  styleName: z.string().optional(),
  quantity: z.number().min(1, "Quantity required"),
  unit: z.string().default("PCS"),
  orderDate: z.date().default(() => new Date()),
  deliveryDate: z.date().optional(),
  paymentTerms: z.string().optional(),
  remarks: z.string().optional(),
  details: z.array(detailSchema).min(1, "Add at least one item"),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const { data: customers } = api.customers.list.useQuery({ page: 1, limit: 100 });

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema) as Resolver<OrderForm>,
    defaultValues: {
      unit: "PCS",
      orderDate: new Date(),
      details: [{ color: "", quantity: 1, unitPrice: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "details" });

  const createOrder = api.orders.create.useMutation({
    onSuccess: () => { toast.success("Order created"); router.push("/orders"); },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data: OrderForm) => createOrder.mutate(data);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new customer order</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select onValueChange={(v) => setValue("customerId", v)}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.data.map((c: typeof customers.data[number]) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Buyer Order No.</Label>
              <Input {...register("buyerOrderNo")} placeholder="Buyer's PO number" />
            </div>

            <div className="space-y-1.5">
              <Label>Style Name</Label>
              <Input {...register("styleName")} placeholder="Style / Item name" />
            </div>

            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select defaultValue="PCS" onValueChange={(v) => setValue("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PCS">PCS</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="MTR">MTR</SelectItem>
                  <SelectItem value="DZ">DZ (Dozen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Total Quantity *</Label>
              <Input type="number" {...register("quantity", { valueAsNumber: true })} placeholder="0" />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Select onValueChange={(v) => setValue("paymentTerms", v)}>
                <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advance">100% Advance</SelectItem>
                  <SelectItem value="50-50">50% Advance + 50% on Delivery</SelectItem>
                  <SelectItem value="Net30">Net 30 Days</SelectItem>
                  <SelectItem value="Net45">Net 45 Days</SelectItem>
                  <SelectItem value="LC">Letter of Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Order Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]}
                onChange={(e) => setValue("orderDate", new Date(e.target.value))} />
            </div>

            <div className="space-y-1.5">
              <Label>Delivery Date</Label>
              <Input type="date" onChange={(e) => setValue("deliveryDate", new Date(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items / Colors</CardTitle>
            <Button type="button" variant="outline" size="sm"
              onClick={() => append({ color: "", quantity: 1, unitPrice: 0, amount: 0 })}>
              <Plus className="h-4 w-4 mr-1" /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {errors.details && (
              <p className="text-xs text-red-500">{errors.details.root?.message ?? errors.details.message}</p>
            )}
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Color *</Label>
                  <Input {...register(`details.${idx}.color`)} placeholder="White" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty *</Label>
                  <Input type="number" {...register(`details.${idx}.quantity`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const qty = parseFloat(e.target.value) || 0;
                      const rate = watch(`details.${idx}.unitPrice`) || 0;
                      setValue(`details.${idx}.amount`, qty * rate);
                    }
                  })} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Unit Price</Label>
                  <Input type="number" step="0.01" {...register(`details.${idx}.unitPrice`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const qty = watch(`details.${idx}.quantity`) || 0;
                      setValue(`details.${idx}.amount`, qty * rate);
                    }
                  })} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <Input type="number" step="0.01" {...register(`details.${idx}.amount`, { valueAsNumber: true })} placeholder="0.00" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}
                  disabled={fields.length === 1} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} placeholder="Additional notes..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={createOrder.isPending}>Create Order</Button>
        </div>
      </form>
    </div>
  );
}
