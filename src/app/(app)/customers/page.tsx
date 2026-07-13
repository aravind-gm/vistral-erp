"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerDialog } from "@/features/customers/components/customer-dialog";
import { toast } from "sonner";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = api.useUtils();

  const { data, isLoading } = api.customers.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  });

  const deleteMutation = api.customers.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted");
      void utils.customers.list.invalidate();
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const toggleActiveMutation = api.customers.toggleActive.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Customer activated" : "Customer deactivated");
      void utils.customers.list.invalidate();
    },
  });

  return (
    <div className="space-y-4 pt-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Customers</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Manage customer accounts and orders
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            startIcon={<Search className="h-4 w-4" />}
            placeholder="Search by name, code, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-[#F3F4F6]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-12 w-12 text-[#D1D5DB] mb-3" />
              <p className="text-sm font-medium text-[#374151]">
                {search ? "No customers found" : "No customers yet"}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first customer to get started"}
              </p>
              {!search && (
                <Button className="mt-4" size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_140px_120px_100px_80px_40px] items-center gap-4 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Customer</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Phone</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Location</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Orders</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</span>
                <span />
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#F3F4F6]">
                {data?.data.map((customer: typeof data.data[number]) => (
                  <div
                    key={customer.id}
                    className="grid grid-cols-[1fr_140px_120px_100px_80px_40px] items-center gap-4 px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                  >
                    {/* Name */}
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <p className="text-sm font-medium text-[#111827]">{customer.name}</p>
                      <p className="text-xs text-[#9CA3AF] font-mono">{customer.code}</p>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1.5 text-sm text-[#374151]">
                      <Phone className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="font-mono text-xs">{customer.phone}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <MapPin className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{customer.city}, {customer.state}</span>
                    </div>

                    {/* Orders */}
                    <span className="text-sm font-medium text-[#374151] font-mono">
                      {customer._count.orders}
                    </span>

                    {/* Status */}
                    <Badge variant={customer.isActive ? "success" : "secondary"}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </Badge>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/customers/${customer.id}`)}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: customer.id,
                              isActive: !customer.isActive,
                            })
                          }
                        >
                          {customer.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[#DC2626] focus:text-[#DC2626] focus:bg-[#FEE2E2]"
                          onClick={() => {
                            if (confirm("Delete this customer? This cannot be undone.")) {
                              deleteMutation.mutate({ id: customer.id });
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
                  <p className="text-xs text-[#6B7280]">
                    Showing {(page - 1) * 20 + 1}–
                    {Math.min(page * 20, data.meta.total)} of {data.meta.total} customers
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.meta.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => void utils.customers.list.invalidate()}
      />
    </div>
  );
}
