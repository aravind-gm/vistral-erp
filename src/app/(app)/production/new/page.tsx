"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewProductionBatchPage() {
  const router = useRouter();
  const { data: orders } = api.orders.list.useQuery({ page: 1, limit: 100, status: "CONFIRMED" });

  const batchSchema = z.object({
    orderId: z.string().min(1, "Please select an order"),
    quantity: z.number().min(1, "Quantity required"),
    remarks: z.string().optional(),
  });

  type BatchForm = z.infer<typeof batchSchema>;

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: { orderId: "", quantity: 1, remarks: "" },
  });

  const createBatch = api.production.createBatch.useMutation({
    onSuccess: () => {
      toast.success("Production batch created");
      router.push("/production");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: BatchForm) => createBatch.mutate(data);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">New Production Batch</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create a new production batch from an approved order.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/production") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Production
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Batch details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Approved order *</Label>
              <Select value={watch("orderId")} onValueChange={(value) => setValue("orderId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.data.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNo} — {order.customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orderId && <p className="text-xs text-red-500">{errors.orderId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Batch quantity *</Label>
              <Input type="number" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Remarks</Label>
              <Textarea {...register("remarks")} rows={4} placeholder="Optional notes" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/production")}>Cancel</Button>
          <Button type="submit" loading={createBatch.isPending}>Create Batch</Button>
        </div>
      </form>
    </div>
  );
}
