"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const inventorySchema = z.object({
  yarnTypeId: z.string().min(1, "Yarn type is required"),
  supplierId: z.string().optional(),
  lotNo: z.string().optional(),
  quantity: z.number().min(0.001, "Quantity is required"),
  unit: z.string().default("KG"),
  location: z.string().optional(),
  reorderLevel: z.number().min(0).default(0),
  remarks: z.string().optional(),
});

type InventoryForm = z.infer<typeof inventorySchema>;

export default function NewInventoryPage() {
  const router = useRouter();
  const { data: yarnTypes } = api.yarn.listTypes.useQuery();
  const { data: suppliers } = api.suppliers.list.useQuery({ page: 1, limit: 100 });

  const { register, handleSubmit, formState: { errors } } = useForm<InventoryForm>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      yarnTypeId: "",
      supplierId: "",
      lotNo: "",
      quantity: 0.1,
      unit: "KG",
      location: "",
      reorderLevel: 0,
      remarks: "",
    },
  });

  const createInventory = api.yarn.createInventory.useMutation({
    onSuccess: () => {
      toast.success("Inventory added");
      router.push("/yarn/inventory");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: InventoryForm) => createInventory.mutate(data);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Add Yarn Inventory</h1>
          <p className="text-sm text-[#6B7280] mt-1">Register a yarn receipt or stock addition.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/yarn/inventory") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Inventory
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Yarn type *</Label>
              <select className="input w-full" {...register("yarnTypeId")}> 
                <option value="">Select a yarn type</option>
                {yarnTypes?.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.yarnTypeId && <p className="text-xs text-red-500">{errors.yarnTypeId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <select className="input w-full" {...register("supplierId")}> 
                <option value="">Select supplier</option>
                {suppliers?.data.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Lot number</Label>
              <Input {...register("lotNo")} />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity *</Label>
              <Input type="number" step="0.001" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input {...register("unit")} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder level</Label>
              <Input type="number" step="0.001" {...register("reorderLevel", { valueAsNumber: true })} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/yarn/inventory")}>Cancel</Button>
          <Button type="submit" loading={createInventory.isPending}>Add Inventory</Button>
        </div>
      </form>
    </div>
  );
}
