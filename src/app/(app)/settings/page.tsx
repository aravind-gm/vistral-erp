"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Resolver } from "react-hook-form";

const companySchema = z.object({
  name: z.string().min(1, "Company name required"),
  legalName: z.string().min(1, "Legal name required"),
  gstin: z.string().min(15).max(15),
  pan: z.string().min(10).max(10),
  addressLine1: z.string().min(1, "Address required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  pincode: z.string().min(6, "Pincode required"),
  phone: z.string().min(10, "Phone required"),
  email: z.string().email("Invalid email"),
  website: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function SettingsPage() {
  const [tab, setTab] = useState("company");
  const { data, isLoading } = api.settings.getCompany.useQuery();

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema) as Resolver<CompanyForm>,
    values: data ? {
      name: data.name,
      legalName: data.legalName ?? "",
      gstin: data.gstin ?? "",
      pan: data.pan ?? "",
      addressLine1: data.addressLine1 ?? "",
      addressLine2: data.addressLine2 ?? undefined,
      city: data.city ?? "",
      state: data.state ?? "",
      pincode: data.pincode ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      website: data.website ?? undefined,
      bankName: data.bankName ?? undefined,
      bankBranch: data.bankBranch ?? undefined,
      bankAccount: data.bankAccount ?? undefined,
      bankIfsc: data.bankIfsc ?? undefined,
    } : undefined,
  });

  const upsert = api.settings.upsertCompany.useMutation({
    onSuccess: () => toast.success("Settings saved"),
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (formData: CompanyForm) => {
    upsert.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your company and system preferences</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="billing">Bank & Billing</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="company" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : (
                  <>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Company Name *</Label>
                      <Input {...register("name")} placeholder="Vistral Textiles Pvt Ltd" />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Legal Name</Label>
                      <Input {...register("legalName")} placeholder="As per GST registration" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>GSTIN</Label>
                      <Input {...register("gstin")} placeholder="33AAAAA0000A1Z5" className="font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>PAN</Label>
                      <Input {...register("pan")} placeholder="AAAAA0000A" className="font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input {...register("phone")} placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input {...register("email")} placeholder="info@company.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Website</Label>
                      <Input {...register("website")} placeholder="www.company.com" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Address Line 1</Label>
                      <Input {...register("addressLine1")} placeholder="Street / Area" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input {...register("city")} placeholder="Tiruppur" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State</Label>
                      <Input {...register("state")} placeholder="Tamil Nadu" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pincode</Label>
                      <Input {...register("pincode")} placeholder="641601" className="font-mono" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label>Bank Name</Label>
                      <Input {...register("bankName")} placeholder="State Bank of India" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Branch</Label>
                      <Input {...register("bankBranch")} placeholder="Tiruppur Main Branch" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Account Number</Label>
                      <Input {...register("bankAccount")} className="font-mono" placeholder="000000000000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>IFSC Code</Label>
                      <Input {...register("bankIfsc")} className="font-mono" placeholder="SBIN0000001" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={upsert.isPending}>
              Save Settings
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
