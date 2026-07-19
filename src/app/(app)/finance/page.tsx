"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, IndianRupee, TrendingUp, Download, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/dashboard/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const INVOICE_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive"> = {
  DRAFT: "default",
  SENT: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "destructive",
};

export default function FinancePage() {
  const router = useRouter();
  const [tab, setTab] = useState("invoices");
  const [page, setPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
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

  const invoices = api.finance.listInvoices.useQuery({ page, limit: 20 });
  const payments = api.finance.listPayments.useQuery({ page: paymentsPage, limit: 20 });
  const recordPaymentMutation = api.finance.recordPayment.useMutation();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const gstReport = api.finance.getGSTReport.useQuery({
    fromDate: firstDay,
    toDate: lastDay,
  });

  const handleExportGSTR1 = () => {
    if (!gstReport.data?.invoices?.length) {
      toast.error("No invoices found for this month's GST report");
      return;
    }
    const reportData = gstReport.data.invoices.map((inv: any) => ({
      "Invoice No": inv.invoiceNo,
      "Invoice Date": formatDate(inv.invoiceDate),
      "Customer Name": inv.customer?.name || "-",
      "Customer GSTIN": inv.customer?.gstin || "-",
      "State": inv.customer?.state || "-",
      "Taxable Value": Number(inv.taxableAmount),
      "CGST (50%)": Number(inv.cgst),
      "SGST (50%)": Number(inv.sgst),
      "IGST (100%)": Number(inv.igst),
      "Total GST Amount": Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst),
      "Total Value": Number(inv.totalAmount),
    }));
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GSTR-1 Report");
    XLSX.writeFile(workbook, `GSTR1_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel GSTR-1 report downloaded!");
  };

  const handleSavePayment = async () => {
    if (!paymentForm.invoiceId) {
      toast.error("Select an invoice");
      return;
    }
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Enter a valid payment amount");
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
      toast.success("Payment recorded successfully");
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
      invoices.refetch();
      payments.refetch();
      gstReport.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  const totalPaid = invoices.data?.data
    .filter((inv: { paymentStatus: string }) => inv.paymentStatus === "PAID")
    .reduce((s: number, inv: { totalAmount: unknown }) => s + Number(inv.totalAmount), 0) ?? 0;

  const totalPending = invoices.data?.data
    .filter((inv: { paymentStatus: string }) => inv.paymentStatus === "PENDING")
    .reduce((s: number, inv: { totalAmount: unknown }) => s + Number(inv.totalAmount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Invoices, payments and GST reports</p>
        </div>
        <Button onClick={() => router.push("/finance/invoices/new") }>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Collected</p>
                <p className="text-xl font-bold font-mono">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold font-mono">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">GST This Month</p>
                <p className="text-xl font-bold font-mono">{formatCurrency(Number(gstReport.data?.summary.totalTax ?? 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="gst">GST Report</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : !invoices.data?.data.length ? (
                <div className="p-12 text-center text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No invoices yet</p>
                  <p className="text-sm mt-1">Create your first invoice from a completed order</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Invoice #</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Customer</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Due Date</th>
                        <th className="text-right px-6 py-3 font-medium text-gray-600">Amount</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.data.data.map((inv: typeof invoices.data.data[number]) => (
                        <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 font-mono font-medium">{inv.invoiceNo}</td>
                          <td className="px-6 py-4">{inv.customer?.name ?? "-"}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                          <td className="px-6 py-4 text-gray-500">{inv.dueDate ? formatDate(inv.dueDate) : "-"}</td>
                          <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(Number(inv.totalAmount))}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={INVOICE_STATUS_VARIANT[inv.status] ?? "default"}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.data.meta.total > 20 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, invoices.data.meta.total)} of {invoices.data.meta.total}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page * 20 >= invoices.data.meta.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center text-gray-400">
              <IndianRupee className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Payment register coming soon</p>
              <p className="text-sm mt-1">Record and track all customer payments here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Report — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
            </CardHeader>
            <CardContent>
              {gstReport.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Taxable Amount", value: formatCurrency(Number(gstReport.data?.summary.totalTaxable ?? 0)) },
                      { label: "CGST", value: formatCurrency(Number(gstReport.data?.summary.totalCGST ?? 0)) },
                      { label: "SGST", value: formatCurrency(Number(gstReport.data?.summary.totalSGST ?? 0)) },
                      { label: "Total GST", value: formatCurrency(Number(gstReport.data?.summary.totalTax ?? 0)) },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-bold font-mono mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    * Based on invoices created this month. Export to Excel for GSTR-1 filing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
