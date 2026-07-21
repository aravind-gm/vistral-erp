"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Phone, Mail, Building2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = api.suppliers.list.useQuery({
    search: search || undefined,
    page,
    limit: 20,
  });

  const deleteSupplier = api.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage yarn and material suppliers
          </p>
        </div>
        <Button onClick={() => router.push("/suppliers/new") }>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No suppliers found</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first supplier to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-6 py-3 font-medium text-gray-600">Supplier Name</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Contact Person</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Phone</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Location</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.data.map((supplier: typeof data.data[number]) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div>{supplier.name}</div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {supplier.supplierType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{supplier.contactPerson || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{supplier.phone || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{supplier.email || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {supplier.city ?? ""}{supplier.city && supplier.state ? ", " : ""}{supplier.state ?? ""}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={supplier.isActive ? "success" : "secondary"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteSupplier.mutate({ id: supplier.id })}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.meta.total > 20 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} of{" "}
                {data.meta.total} suppliers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 20 >= data.meta.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
