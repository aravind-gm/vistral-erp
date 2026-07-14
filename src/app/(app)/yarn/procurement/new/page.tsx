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

const procurementSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  expectedDate: z.string().optional(),
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
  const { data: suppliers } = api.suppliers.list.useQuery({ page: 1, limit: 100 });
  const { data: yarnTypes } = api.yarn.listTypes.useQuery();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcurementForm>({
    resolver: zodResolver(procurementSchema),
    defaultValues: {
      supplierId: "",
      expectedDate: "",
      remarks: "",
      items: [{ yarnTypeId: "", quantity: 0.1, unit: "KG", unitPrice: 0, amount: 0, hsn: "", gstPercent: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const createProcurement = api.yarn.createProcurement.useMutation({
    onSuccess: () => {
      toast.success("Procurement order created");
      router.push("/yarn/procurement");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: ProcurementForm) => {
    createProcurement.mutate({
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">New Procurement</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create a new yarn procurement order.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/yarn") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Yarn
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Procurement details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supplier *</Label>
              <Select value={watch("supplierId")} onValueChange={(value) => setValue("supplierId", value)}>
                <SelectTrigger>
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
              {errors.supplierId && <p className="text-xs text-red-500">{errors.supplierId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Expected date</Label>
              <Input
                type="date"
                value={watch("expectedDate") ? new Date(watch("expectedDate") as Date).toISOString().split("T")[0] : ""}
                onChange={(e) => setValue("expectedDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} rows={3} placeholder="Optional notes" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => append({ yarnTypeId: "", quantity: 0.1, unit: "KG", unitPrice: 0, amount: 0, hsn: "", gstPercent: 5 })}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-end">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Yarn type *</Label>
                  <Select value={watch(`items.${index}.yarnTypeId`)} onValueChange={(value) => setValue(`items.${index}.yarnTypeId`, value)}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-1.5">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    step="0.001"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                      onChange: (event) => {
                        const qty = parseFloat(event.target.value) || 0;
                        const rate = watch(`items.${index}.unitPrice`) || 0;
                        setValue(`items.${index}.amount`, qty * rate);
                      },
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Unit price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                      onChange: (event) => {
                        const rate = parseFloat(event.target.value) || 0;
                        const qty = watch(`items.${index}.quantity`) || 0;
                        setValue(`items.${index}.amount`, qty * rate);
                      },
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.amount`, { valueAsNumber: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  <Input type="number" step="0.1" {...register(`items.${index}.gstPercent`, { valueAsNumber: true })} />
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/yarn/procurement")}>Cancel</Button>
          <Button type="submit" loading={createProcurement.isPending}>Create Procurement</Button>
        </div>
      </form>
    </div>
  );
}
