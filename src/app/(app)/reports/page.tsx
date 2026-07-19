"use client";

import { useMemo } from "react";
import { api } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FileText, TrendingUp, Download, AlertTriangle, CheckCircle, IndianRupee, Layers } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/dashboard/utils/formatters";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const stats = api.dashboard.stats.useQuery();
  const inventory = api.yarn.getInventory.useQuery();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const gstReport = api.finance.getGSTReport.useQuery({
    fromDate: firstDay,
    toDate: lastDay,
  });

  const lowStockItems = useMemo(() => {
    return inventory.data?.filter((stock) => Number(stock.availableStock) <= Number(stock.reorderLevel)) ?? [];
  }, [inventory.data]);

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

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Business Analytics & Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">Cross-module operational and financial reports for management decisions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Performance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Sales & Order Performance</CardTitle>
                <CardDescription>Order conversion rates and aggregated totals.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Total Orders Placed</span>
                  <span className="font-bold text-gray-900 font-mono">{stats.data?.totalOrders}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Active Production Orders</span>
                  <span className="font-bold text-gray-900 font-mono">{stats.data?.activeOrders}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Completed Orders Revenue</span>
                  <span className="font-bold text-green-600 font-mono">{formatCurrency(stats.data?.totalRevenue ?? 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Awaiting Invoice Payments</span>
                  <span className="font-bold text-amber-600 font-mono">{stats.data?.pendingInvoices}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GST / Taxation Report Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Taxation (GST) Summaries</CardTitle>
                <CardDescription>Monthly tax calculations and GSTR-1 exports.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gstReport.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">Taxable Val</span>
                    <span className="font-bold block mt-1">{formatCurrency(Number(gstReport.data?.summary.totalTaxable ?? 0))}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">Monthly CGST</span>
                    <span className="font-bold block mt-1">{formatCurrency(Number(gstReport.data?.summary.totalCGST ?? 0))}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">Total GST</span>
                    <span className="font-bold text-blue-600 block mt-1">{formatCurrency(Number(gstReport.data?.summary.totalTax ?? 0))}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleExportGSTR1}
                    disabled={!gstReport.data?.invoices?.length}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download GSTR-1 Excel Sheet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Warning Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Inventory & Procurement Alerts</CardTitle>
                <CardDescription>Stocks requiring immediate replenishment.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {inventory.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-green-700 bg-green-50 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>All yarn stock levels are healthy. No replenishment needed.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border divide-y">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-900 block">{item.yarnType.name}</span>
                        <span className="text-xs text-gray-400 font-mono block">Lot: {item.lotNo || "-"} &bull; Location: {item.location || "-"}</span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="font-mono">
                          <span className="text-gray-400 text-xs block">Available</span>
                          <span className="font-bold text-red-600">{Number(item.availableStock).toFixed(2)} KG</span>
                        </div>
                        <div className="font-mono">
                          <span className="text-gray-400 text-xs block">Reorder Lvl</span>
                          <span className="font-medium text-gray-700">{Number(item.reorderLevel).toFixed(2)} KG</span>
                        </div>
                        <Badge variant="destructive" className="inline-flex gap-1 items-center">
                          <AlertTriangle className="h-3 w-3" /> Reorder
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
