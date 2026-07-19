"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import {
  ShoppingCart,
  Users,
  Factory,
  DollarSign,
  TrendingUp,
  Package,
  Plus,
  ArrowRight,
  TrendingDown,
  Percent,
  Layers,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";
import { toast } from "sonner";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#6B7280]">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-[#111827] font-mono tabular-nums">
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-[#9CA3AF]">{description}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  ENQUIRY: "Enquiry",
  QUOTATION_SENT: "Quotation",
  PO_RECEIVED: "PO Received",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  DISPATCHED: "Dispatched",
  INVOICED: "Invoiced",
  PAYMENT_RECEIVED: "Paid",
  CANCELLED: "Cancelled",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isAuthorized = Boolean(session?.user);

  useEffect(() => {
    if (!isPending && !isAuthorized) {
      router.replace("/login");
    }
  }, [isAuthorized, isPending, router]);

  // Main Queries
  const stats = api.dashboard.stats.useQuery(undefined, { enabled: isAuthorized });
  const recentOrders = api.dashboard.recentOrders.useQuery(undefined, { enabled: isAuthorized });
  const invoices = api.finance.listInvoices.useQuery({ page: 1, limit: 100 }, { enabled: isAuthorized });
  const recordPaymentMutation = api.finance.recordPayment.useMutation();

  // Payment Recording Modal State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    amount: "",
    paymentMode: "UPI" as "CASH" | "CHEQUE" | "NEFT" | "RTGS" | "UPI",
    referenceNo: "",
    bankName: "",
    remarks: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const totalPaid = stats.data?.totalRevenue ?? 0;
  const totalPending = useMemo(() => {
    return invoices.data?.data
      .filter((inv) => inv.paymentStatus !== "PAID" && inv.status !== "CANCELLED")
      .reduce((s, inv) => s + Number(inv.balanceAmount), 0) ?? 0;
  }, [invoices.data]);

  const collectionRatio = useMemo(() => {
    const total = totalPaid + totalPending;
    if (total === 0) return 0;
    return Math.round((totalPaid / total) * 100);
  }, [totalPaid, totalPending]);

  const handleSavePayment = async () => {
    if (!paymentForm.invoiceId) {
      toast.error("Please select an invoice");
      return;
    }
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await recordPaymentMutation.mutateAsync({
        invoiceId: paymentForm.invoiceId,
        amount: Number(paymentForm.amount),
        paymentDate: new Date(paymentForm.paymentDate),
        paymentMode: paymentForm.paymentMode,
        referenceNo: paymentForm.referenceNo || undefined,
        bankName: paymentForm.bankName || undefined,
        remarks: paymentForm.remarks || undefined,
      });
      toast.success("Payment recorded successfully!");
      setIsRecordPaymentOpen(false);
      setPaymentForm({
        invoiceId: "",
        amount: "",
        paymentMode: "UPI",
        referenceNo: "",
        bankName: "",
        remarks: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });
      void stats.refetch();
      void invoices.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  if (isPending || !isAuthorized) {
    return (
      <div className="space-y-6 pt-4">
        <div className="h-8 w-48 rounded-xl bg-[#E5E7EB] animate-pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-3xl bg-[#E5E7EB] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Real-time operations, workflows, and financials &bull; Tiruppur Textiles
          </p>
        </div>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Orders"
          value={stats.data?.totalOrders ?? 0}
          icon={ShoppingCart}
          loading={stats.isLoading}
        />
        <StatCard
          title="Active Orders"
          value={stats.data?.activeOrders ?? 0}
          icon={TrendingUp}
          description="In manufacturing"
          loading={stats.isLoading}
        />
        <StatCard
          title="Active Batches"
          value={stats.data?.productionBatches ?? 0}
          icon={Factory}
          description="In production phases"
          loading={stats.isLoading}
        />
        <StatCard
          title="Customers"
          value={stats.data?.totalCustomers ?? 0}
          icon={Users}
          loading={stats.isLoading}
        />
        <StatCard
          title="Awaiting Payment"
          value={stats.data?.pendingInvoices ?? 0}
          icon={Package}
          description="Unpaid invoices"
          loading={stats.isLoading}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalPaid)}
          icon={DollarSign}
          description="Paid revenue"
          loading={stats.isLoading}
        />
      </div>

      {/* Interactive Charts & Capacity Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Collection Efficiency Gauges */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Cash Flow Efficiency</CardTitle>
            <CardDescription>Paid revenue vs outstanding customer bills.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" fill="transparent" stroke="#E2E8F0" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * collectionRatio) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">{collectionRatio}%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Collected</span>
              </div>
            </div>
            <div className="w-full space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500 font-sans flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Collected</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500 font-sans flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Outstanding</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalPending)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcut workflows for common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5">
            <Button
              onClick={() => router.push("/orders/new")}
              variant="outline"
              className="w-full justify-start text-xs font-medium"
            >
              <Plus className="h-4 w-4 mr-2 text-blue-600" /> Place New Sales Order
            </Button>
            <Button
              onClick={() => router.push("/finance/invoices/new")}
              variant="outline"
              className="w-full justify-start text-xs font-medium"
            >
              <Plus className="h-4 w-4 mr-2 text-green-600" /> Generate Sales Invoice
            </Button>
            <Button
              onClick={() => setIsRecordPaymentOpen(true)}
              variant="outline"
              className="w-full justify-start text-xs font-medium"
            >
              <Plus className="h-4 w-4 mr-2 text-purple-600" /> Log Invoice Payment
            </Button>
            <Button
              onClick={() => router.push("/yarn/inventory/new")}
              variant="outline"
              className="w-full justify-start text-xs font-medium"
            >
              <Plus className="h-4 w-4 mr-2 text-amber-600" /> Receive Yarn Inventory
            </Button>
            <Button
              onClick={() => router.push("/purchase")}
              variant="outline"
              className="w-full justify-start text-xs font-medium"
            >
              <Plus className="h-4 w-4 mr-2 text-rose-600" /> Create Material PO
            </Button>
          </CardContent>
        </Card>

        {/* Production Operations Summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Operations Health</CardTitle>
            <CardDescription>Status check across fabric & garment lines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">Fabric Knitting Status</span>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-1.5">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <Factory className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">Garment Stitching Lines</span>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-1.5">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">Packing & Dispatch Readiness</span>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-1.5">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sales Orders</CardTitle>
            <CardDescription>Track state of newly logged customer accounts.</CardDescription>
          </div>
          <Button size="sm" variant="ghost" className="text-xs flex items-center gap-1" onClick={() => router.push("/orders")}>
            View All Orders <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-[#D1D5DB] mb-3" />
              <p className="text-sm font-medium text-[#374151]">No orders yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Orders will appear here once created
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {recentOrders.data?.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="flex items-center gap-4 py-3 hover:bg-[#FAFAFA] -mx-6 px-6 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#111827] font-mono">
                        {order.orderNo}
                      </span>
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {order.customer.name} &bull; {order.quantity.toLocaleString("en-IN")} pcs
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#6B7280]">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Delivery</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK PAYMENT RECORDING DIALOG */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Quick Record Payment</DialogTitle>
            <DialogDescription>
              Log a customer payment receipt to reconcile outstanding invoice balances.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Invoice *</Label>
              <Select
                value={paymentForm.invoiceId}
                onValueChange={(value) => {
                  const selectedInv = invoices.data?.data.find((inv) => inv.id === value);
                  setPaymentForm((prev) => ({
                    ...prev,
                    invoiceId: value,
                    amount: selectedInv ? String(Number(selectedInv.balanceAmount)) : "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outstanding invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.data?.data
                    .filter((inv) => inv.paymentStatus !== "PAID" && inv.status !== "CANCELLED")
                    .map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNo} — {inv.customer?.name} (Bal: ₹{Number(inv.balanceAmount).toFixed(2)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Amount Paid (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Payment Mode *</Label>
              <Select
                value={paymentForm.paymentMode}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    paymentMode: value as any,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI / QR Code</SelectItem>
                  <SelectItem value="NEFT">NEFT Transfer</SelectItem>
                  <SelectItem value="RTGS">RTGS Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Reference No / Txn ID</Label>
                <Input
                  placeholder="e.g. UTR12345..."
                  value={paymentForm.referenceNo}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, referenceNo: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bank Name</Label>
                <Input
                  placeholder="e.g. HDFC Bank"
                  value={paymentForm.bankName}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, bankName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Transaction details..."
                rows={2}
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} loading={recordPaymentMutation.isPending}>
              Save Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
