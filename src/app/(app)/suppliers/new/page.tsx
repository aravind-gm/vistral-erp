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

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone is required"),
  altPhone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode is required"),
  country: z.string().default("India"),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  supplierType: z.string().min(1, "Supplier type is required"),
  notes: z.string().optional(),
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function NewSupplierPage() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      altPhone: "",
      gstin: "",
      pan: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      bankName: "",
      bankBranch: "",
      bankAccount: "",
      bankIfsc: "",
      supplierType: "",
      notes: "",
    },
  });

  const createSupplier = api.suppliers.create.useMutation({
    onSuccess: () => {
      toast.success("Supplier added");
      router.push("/suppliers");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: SupplierForm) => createSupplier.mutate(data);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Add Supplier</h1>
          <p className="text-sm text-[#6B7280] mt-1">Add a new supplier to your material network.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/suppliers") }>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Suppliers
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Supplier type *</Label>
              <Input {...register("supplierType")} />
              {errors.supplierType && <p className="text-xs text-red-500">{errors.supplierType.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Contact person</Label>
              <Input {...register("contactPerson")} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Alternate phone</Label>
              <Input {...register("altPhone")} />
            </div>
            <div className="space-y-1.5">
              <Label>GSTIN</Label>
              <Input {...register("gstin")} />
            </div>
            <div className="space-y-1.5">
              <Label>PAN</Label>
              <Input {...register("pan")} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Address line 1 *</Label>
              <Input {...register("addressLine1")} />
              {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Address line 2</Label>
              <Input {...register("addressLine2")} />
            </div>
            <div className="space-y-1.5">
              <Label>City *</Label>
              <Input {...register("city")} />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>State *</Label>
              <Input {...register("state")} />
              {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Pincode *</Label>
              <Input {...register("pincode")} />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input {...register("country")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank & notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Bank name</Label>
              <Input {...register("bankName")} />
            </div>
            <div className="space-y-1.5">
              <Label>Bank branch</Label>
              <Input {...register("bankBranch")} />
            </div>
            <div className="space-y-1.5">
              <Label>Bank account</Label>
              <Input {...register("bankAccount")} />
            </div>
            <div className="space-y-1.5">
              <Label>IFSC</Label>
              <Input {...register("bankIfsc")} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={4} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/suppliers")}>Cancel</Button>
          <Button type="submit" loading={createSupplier.isPending}>Create Supplier</Button>
        </div>
      </form>
    </div>
  );
}
