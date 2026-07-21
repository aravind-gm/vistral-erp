"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Printer, 
  Eye, 
  Calendar, 
  Building2,
  FileText,
  DollarSign
} from "lucide-react";
import { formatDate } from "@/features/dashboard/utils/formatters";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = api.yarn.listProcurements.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "ORDERED":
        return "bg-yellow-50 text-yellow-800 border-yellow-100";
      case "RECEIVED":
        return "bg-green-50 text-green-700 border-green-100";
      case "PARTIAL_RECEIVED":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-red-50 text-red-700 border-red-100";
    }
  };

  const handlePrintYarnPO = (po: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented opening the print window");
      return;
    }

    const itemsRows = po.items.map((item: any, index: number) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.unitPrice) || 0;
      const gst = parseFloat(item.gstPercent) || 5;
      const netAmount = qty * rate;
      const gstAmount = netAmount * (gst / 100);
      const totalAmount = netAmount + gstAmount;

      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">
            <strong>${item.yarnType?.name || "Yarn"}</strong>
            ${item.yarnType?.count ? `<br><small style="color: #666;">Count: ${item.yarnType.count}</small>` : ""}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${qty.toFixed(2)} KG</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${rate.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${netAmount.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${gst}%</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${totalAmount.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const totalQty = po.items.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity) || 0), 0);
    const subtotal = po.items.reduce((sum: number, item: any) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
    const gstTotal = po.items.reduce((sum: number, item: any) => {
      const net = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      return sum + (net * ((parseFloat(item.gstPercent) || 5) / 100));
    }, 0);
    const grandTotal = subtotal + gstTotal;

    const html = `
      <html>
        <head>
          <title>Yarn Purchase Order - ${po.poNo}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 30px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
            th { background-color: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; font-size: 13px; }
            td { font-size: 13px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px; }
            .party-details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            .party-card { border: 1px solid #ddd; padding: 15px; border-radius: 6px; background-color: #fafafa; }
            .po-title { font-size: 24px; font-weight: bold; color: #111; text-transform: uppercase; margin: 0; }
            .totals-table { width: 40%; margin-left: auto; margin-top: 15px; }
            .totals-table td { padding: 6px 10px; border: 1px solid #ddd; }
            .footer-sigs { display: grid; grid-template-cols: 1fr 1fr; gap: 60px; margin-top: 60px; }
            .sig-block { border-top: 1px dashed #999; margin-top: 60px; padding-top: 8px; text-align: center; font-size: 12px; font-weight: bold; }
            @media print {
              body { margin: 15px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div class="po-title">Yarn Purchase Order (YPO)</div>
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #111827; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print / Save PDF</button>
          </div>

          <div class="header">
            <div>
              <h3>VISTRAL TEXTILES</h3>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">Sector-4, Industrial Area, Tiruppur, India</p>
              <p style="font-size: 12px; color: #666; margin: 2px 0;">GSTIN: 33ABCDE1234F1Z0</p>
            </div>
            <div style="text-align: right;">
              <p><strong>PO Number:</strong> ${po.poNo}</p>
              <p><strong>Date:</strong> ${new Date(po.poDate || po.createdAt).toLocaleDateString("en-IN")}</p>
              <p><strong>Expected Delivery:</strong> ${po.expectedDate ? new Date(po.expectedDate).toLocaleDateString("en-IN") : "Immediate"}</p>
              <p><strong>Status:</strong> ${po.status}</p>
            </div>
          </div>

          <div class="party-details">
            <div class="party-card">
              <strong style="font-size: 14px; text-transform: uppercase; color: #555;">Supplier Details</strong>
              <h4 style="margin: 8px 0 4px 0; font-size: 15px;">${po.supplier?.name}</h4>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">Code: ${po.supplier?.code || "-"}</p>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">City: ${po.supplier?.city || "-"}</p>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">State: ${po.supplier?.state || "-"}</p>
            </div>
            <div class="party-card">
              <strong style="font-size: 14px; text-transform: uppercase; color: #555;">Delivery Destination</strong>
              <h4 style="margin: 8px 0 4px 0; font-size: 15px;">Vistral Store / Warehouse</h4>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">Contact Store Manager: +91 99944 88811</p>
              <p style="margin: 2px 0; font-size: 12px; color: #666;">Terms: Delivery to mill gates</p>
            </div>
          </div>

          <table style="width: 100%;">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">S.No</th>
                <th>Yarn Specification / Count</th>
                <th style="text-align: center; width: 120px;">Qty Required</th>
                <th style="text-align: right; width: 120px;">Rate / Kg</th>
                <th style="text-align: right; width: 140px;">Net Amount</th>
                <th style="text-align: center; width: 80px;">GST %</th>
                <th style="text-align: right; width: 150px;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px;">
            <div style="width: 50%;">
              <strong>Terms & Remarks:</strong>
              <p style="font-size: 12px; color: #555; background-color: #fcfcfc; padding: 10px; border: 1px solid #eee; border-radius: 4px; min-height: 50px; margin-top: 5px;">
                ${po.remarks ? po.remarks.replace(/\n/g, '<br>') : "Standard spinning mill quality parameters apply. Yarn counts must match specifications strictly."}
              </p>
            </div>
            <table class="totals-table">
              <tr>
                <td>Total Quantity:</td>
                <td style="text-align: right; font-weight: bold;">${totalQty.toFixed(2)} KG</td>
              </tr>
              <tr>
                <td>Subtotal (Net):</td>
                <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Estimated GST:</td>
                <td style="text-align: right;">₹${gstTotal.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td>Total PO Value:</td>
                <td style="text-align: right; color: #111;">₹${grandTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer-sigs">
            <div class="sig-block">
              Prepared By (Merchandiser / Purchase)
            </div>
            <div class="sig-block">
              Authorized Signature (Director)
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pt-4 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Yarn Procurement & POs</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track and manage spinning mill purchase orders (POs) and inventory issues.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/yarn") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={() => router.push("/yarn/procurement/new") } className="bg-[#111827] hover:bg-black text-white">
            <Plus className="h-4 w-4 mr-2" /> Create Yarn PO
          </Button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4 grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by PO number or supplier name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div>
            <Select value={status} onValueChange={(val) => setStatus(val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="APPROVED">APPROVED</SelectItem>
                <SelectItem value="ORDERED">ORDERED</SelectItem>
                <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center text-xs text-gray-500 justify-end">
            Showing {data?.data?.length || 0} orders
          </div>
        </CardContent>
      </Card>

      {/* Procurement PO Table */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">PO Date</th>
                <th className="p-4">Expected Date</th>
                <th className="p-4">Items / Counts</th>
                <th className="p-4 text-right">PO Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-gray-500">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-gray-500">
                    No purchase orders found. Click "Create Yarn PO" to start.
                  </td>
                </tr>
              ) : (
                data.data.map((po) => {
                  const totalQty = po.items.reduce((sum, item) => sum + (parseFloat(item.quantity as any) || 0), 0);

                  return (
                    <tr key={po.id} className="hover:bg-gray-50/50 text-xs text-gray-700 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{po.poNo}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {po.supplier?.name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{formatDate(po.poDate || po.createdAt)}</td>
                      <td className="p-4 text-gray-500">
                        {po.expectedDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(po.expectedDate)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {po.items.map((item: any, i: number) => (
                            <div key={item.id || i} className="text-[10px] text-gray-600 bg-gray-100/75 rounded px-1.5 py-0.5 inline-block mr-1">
                              {item.yarnType?.name} ({parseFloat(item.quantity).toFixed(0)} Kg)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-[#111827]">
                        ₹{(parseFloat(po.totalAmount as any) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className={`font-bold px-2 py-0.5 rounded ${getStatusColor(po.status)}`}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePrintYarnPO(po)}
                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Print PO PDF"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
