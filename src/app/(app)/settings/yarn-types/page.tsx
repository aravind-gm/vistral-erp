"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Package } from "lucide-react";

type YarnTypeForm = {
  name: string;
  count: string;
  composition: string;
  ply: number;
  unit: string;
  hsn?: string;
};

export default function Page() {
  const router = useRouter();
  const yarnTypes = api.yarn.listTypes.useQuery();
  const createYarnType = api.yarn.createType.useMutation({
    onSuccess: () => {
      toast.success("Yarn type created");
      void yarnTypes.refetch();
      reset({ name: "", count: "", composition: "", ply: 1, unit: "KG", hsn: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<YarnTypeForm>({
    defaultValues: {
      name: "",
      count: "",
      composition: "",
      ply: 1,
      unit: "KG",
      hsn: "",
    },
  });

  const onSubmit = (values: YarnTypeForm) => {
    createYarnType.mutate({
      ...values,
      ply: Number(values.ply),
      hsn: values.hsn || undefined,
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Yarn Types</h1>
          <p className="text-sm text-[#6B7280] mt-1">Define yarn categories and specifications.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/yarn/procurement") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={() => router.push("/yarn/procurement") }>
            <Package className="h-4 w-4 mr-2" /> Yarn Procurement
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yarn type settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[1fr_320px] p-6">
        <div>
          {yarnTypes.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !yarnTypes.data?.length ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-[#FAFAFA] p-8 text-center text-sm text-[#4B5563]">
              <p className="font-medium text-[#111827]">No yarn types found</p>
              <p className="mt-2">Yarn types are not yet configured. Create them below to get started.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Count</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Composition</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Unit</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {yarnTypes.data.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                      <td className="px-6 py-4 text-gray-600">{type.count}</td>
                      <td className="px-6 py-4 text-gray-600">{type.composition ?? "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{type.unit}</td>
                      <td className="px-6 py-4">
                        <Badge variant={type.isActive ? "success" : "secondary"}>
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900">Create New Yarn Type</p>
            <p className="text-sm text-gray-500">Add a yarn type so it appears in inventory and procurement.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Count</label>
              <Input {...register("count", { required: "Count is required" })} />
              {errors.count && <p className="mt-1 text-xs text-red-500">{errors.count.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Composition</label>
              <Input {...register("composition", { required: "Composition is required" })} />
              {errors.composition && <p className="mt-1 text-xs text-red-500">{errors.composition.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ply</label>
                <Input type="number" min={1} {...register("ply", { valueAsNumber: true, required: "Ply is required" })} />
                {errors.ply && <p className="mt-1 text-xs text-red-500">{errors.ply.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <Input {...register("unit", { required: "Unit is required" })} />
                {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">HSN</label>
              <Input {...register("hsn")} />
            </div>
            <Button type="submit" loading={createYarnType.isPending}>
              Create yarn type
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
);
}

