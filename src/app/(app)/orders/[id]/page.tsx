"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, Trash2, Save, FileSpreadsheet, Percent, IndianRupee, FileText } from "lucide-react";
import { formatDate, getOrderStatusVariant } from "@/features/dashboard/utils/formatters";

interface FabricCosting {
  id: string;
  name: string;
  yarnRate: number | string;
  knittingRate: number | string;
  dyeingRate: number | string;
  heatsettingRate: number | string;
  centeringRate: number | string;
  compactingRate: number | string;
  bioWashRate: number | string;
  lossPercent: number | string;
  consumption: number | string;
  itemIds?: string[];
}

interface CostingData {
  fabrics: FabricCosting[];
  cmt_cutting: number | string;
  cmt_singer: number | string;
  cmt_powerTable: number | string;
  cmt_checking: number | string;
  cmt_ironingPacking: number | string;
  cmt: number | string;
  elastic: number | string;
  rope: number | string;
  accessories: {
    mainLabel: number | string;
    washcareLabel: number | string;
    tag: number | string;
    thread: number | string;
    hoodRope: number | string;
    customAccessory: number | string;
  };
  packing: {
    bow: number | string;
    elasticPacking: number | string;
    polyBag: number | string;
    courier: number | string;
    cartonBox: number | string;
    cartonBoxSticker: number | string;
    sizeSticker: number | string;
    transports: number | string;
    others: number | string;
  };
  productionLossPercent: number | string;
  profitPercent: number | string;
  remarks: string;
}

const DEFAULT_COSTING: CostingData = {
  fabrics: [
    { id: "1", name: "BODY FABRIC", yarnRate: "", knittingRate: "", dyeingRate: "", heatsettingRate: "", centeringRate: "", compactingRate: "", bioWashRate: "", lossPercent: "8", consumption: "", itemIds: [] }
  ],
  cmt_cutting: "",
  cmt_singer: "",
  cmt_powerTable: "",
  cmt_checking: "",
  cmt_ironingPacking: "",
  cmt: "",
  elastic: "",
  rope: "",
  accessories: {
    mainLabel: "",
    washcareLabel: "",
    tag: "",
    thread: "",
    hoodRope: "",
    customAccessory: "",
  },
  packing: {
    bow: "",
    elasticPacking: "",
    polyBag: "",
    courier: "",
    cartonBox: "",
    cartonBoxSticker: "",
    sizeSticker: "",
    transports: "",
    others: "",
  },
  productionLossPercent: "2",
  profitPercent: "15",
  remarks: "",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();
  const orderId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id ?? ""),
    [params.id]
  );

  const { data: order, isLoading } = api.orders.byId.useQuery(
    { id: orderId },
    { enabled: Boolean(orderId) }
  );

  const [costing, setCosting] = useState<CostingData>(DEFAULT_COSTING);

  const updateCosting = api.orders.updateCosting.useMutation({
    onSuccess: () => {
      toast.success("Order costing saved successfully");
      void utils.orders.byId.invalidate({ id: orderId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!order) return;
    if (order.orderCosting?.costingDetails) {
      try {
        const details = order.orderCosting.costingDetails as any;
        setCosting({
          fabrics: (details.fabrics || []).map((f: any) => ({
            id: String(f.id),
            name: String(f.name || ""),
            yarnRate: f.yarnRate ?? "",
            knittingRate: f.knittingRate ?? "",
            dyeingRate: f.dyeingRate ?? "",
            heatsettingRate: f.heatsettingRate ?? "",
            centeringRate: f.centeringRate ?? "",
            compactingRate: f.compactingRate ?? "",
            bioWashRate: f.bioWashRate ?? "",
            lossPercent: f.lossPercent ?? "8",
            consumption: f.consumption ?? "",
            itemIds: Array.isArray(f.itemIds) ? f.itemIds.map(String) : [],
          })),
          cmt_cutting: details.cmt_cutting ?? "",
          cmt_singer: details.cmt_singer ?? "",
          cmt_powerTable: details.cmt_powerTable ?? "",
          cmt_checking: details.cmt_checking ?? "",
          cmt_ironingPacking: details.cmt_ironingPacking ?? "",
          cmt: details.cmt ?? "",
          elastic: details.elastic ?? "",
          rope: details.rope ?? "",
          accessories: {
            mainLabel: details.accessories?.mainLabel ?? "",
            washcareLabel: details.accessories?.washcareLabel ?? "",
            tag: details.accessories?.tag ?? "",
            thread: details.accessories?.thread ?? "",
            hoodRope: details.accessories?.hoodRope ?? "",
            customAccessory: details.accessories?.customAccessory ?? "",
          },
          packing: {
            bow: details.packing?.bow ?? "",
            elasticPacking: details.packing?.elasticPacking ?? "",
            polyBag: details.packing?.polyBag ?? "",
            courier: details.packing?.courier ?? "",
            cartonBox: details.packing?.cartonBox ?? "",
            cartonBoxSticker: details.packing?.cartonBoxSticker ?? "",
            sizeSticker: details.packing?.sizeSticker ?? "",
            transports: details.packing?.transports ?? "",
            others: details.packing?.others ?? "",
          },
          productionLossPercent: details.productionLossPercent ?? "2",
          profitPercent: details.profitPercent ?? "15",
          remarks: order.orderCosting.remarks || "",
        });
      } catch (e) {
        console.error("Error loading costing details", e);
      }
    } else if (order.orderCosting) {
      const c = order.orderCosting;
      setCosting((prev) => ({
        ...prev,
        fabrics: [
          {
            id: "1",
            name: "BODY FABRIC",
            yarnRate: c.yarnCost ?? "",
            knittingRate: c.knittingCost ?? "",
            dyeingRate: c.dyeingCost ?? "",
            heatsettingRate: "",
            centeringRate: "",
            compactingRate: c.compactingCost ?? "",
            bioWashRate: "",
            lossPercent: "8",
            consumption: "0.269",
          }
        ],
        cmt: c.stitchingCost ?? "",
        cmt_cutting: "",
        cmt_singer: "",
        cmt_powerTable: "",
        cmt_checking: "",
        cmt_ironingPacking: "",
        packing: {
          ...prev.packing,
          transports: c.packingCost ?? "",
        },
        profitPercent: c.profitPercent ?? "15",
        remarks: c.remarks || "",
      }));
    }
  }, [order]);

  const addFabricRow = () => {
    setCosting((prev) => ({
      ...prev,
      fabrics: [
        ...prev.fabrics,
        {
          id: Date.now().toString(),
          name: "NEW FABRIC",
          yarnRate: "",
          knittingRate: "",
          dyeingRate: "",
          heatsettingRate: "",
          centeringRate: "",
          compactingRate: "",
          bioWashRate: "",
          lossPercent: "8",
          consumption: "",
        },
      ],
    }));
  };

  const removeFabricRow = (id: string) => {
    if (costing.fabrics.length === 1) return;
    setCosting((prev) => ({
      ...prev,
      fabrics: prev.fabrics.filter((f) => f.id !== id),
    }));
  };

  const updateFabricField = (id: string, field: keyof FabricCosting, val: any) => {
    setCosting((prev) => ({
      ...prev,
      fabrics: prev.fabrics.map((f) => {
        if (f.id !== id) return f;
        return {
          ...f,
          [field]: val,
        };
      }),
    }));
  };

  const updateAccessoryField = (field: keyof CostingData["accessories"], val: string) => {
    setCosting((prev) => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [field]: val,
      },
    }));
  };

  const updatePackingField = (field: keyof CostingData["packing"], val: string) => {
    setCosting((prev) => ({
      ...prev,
      packing: {
        ...prev.packing,
        [field]: val,
      },
    }));
  };

  const updateCostingField = (field: "cmt" | "cmt_cutting" | "cmt_singer" | "cmt_powerTable" | "cmt_checking" | "cmt_ironingPacking" | "elastic" | "rope" | "productionLossPercent" | "profitPercent" | "remarks", val: string) => {
    setCosting((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const calculatedCosting = useMemo(() => {
    const fabricsCalculated = costing.fabrics.map((f) => {
      const yarn = parseFloat(f.yarnRate as string) || 0;
      const knitting = parseFloat(f.knittingRate as string) || 0;
      const dyeing = parseFloat(f.dyeingRate as string) || 0;
      const heatset = parseFloat(f.heatsettingRate as string) || 0;
      const centering = parseFloat(f.centeringRate as string) || 0;
      const compacting = parseFloat(f.compactingRate as string) || 0;
      const bioWash = parseFloat(f.bioWashRate as string) || 0;
      const loss = parseFloat(f.lossPercent as string) || 0;
      const cons = parseFloat(f.consumption as string) || 0;

      const sumRates = yarn + knitting + dyeing + heatset + centering + compacting + bioWash;
      const totalRatePerKg = sumRates * (1 + loss / 100);
      const totalCostPerPc = totalRatePerKg * cons;
      return {
        ...f,
        totalRatePerKg,
        totalCostPerPc,
      };
    });

    const totalFabricCostPerPc = fabricsCalculated.reduce((sum, f) => {
      const itemIds = f.itemIds || [];
      const hasMapping = itemIds.length > 0;
      const pcs = hasMapping && order?.orderDetails
        ? order.orderDetails.filter((d) => itemIds.includes(d.id)).reduce((s, d) => s + d.quantity, 0)
        : (order?.quantity || 1);
      
      const proportion = order && order.quantity > 0 ? pcs / order.quantity : 0;
      return sum + (f.totalCostPerPc * proportion);
    }, 0);
    
    const cutting = parseFloat(costing.cmt_cutting as string) || 0;
    const singer = parseFloat(costing.cmt_singer as string) || 0;
    const powerTable = parseFloat(costing.cmt_powerTable as string) || 0;
    const checking = parseFloat(costing.cmt_checking as string) || 0;
    const ironingPacking = parseFloat(costing.cmt_ironingPacking as string) || 0;
    
    const computedCmt = cutting + singer + powerTable + checking + ironingPacking;
    const cmt = computedCmt > 0 ? computedCmt : (parseFloat(costing.cmt as string) || 0);

    const elastic = parseFloat(costing.elastic as string) || 0;
    const rope = parseFloat(costing.rope as string) || 0;
    const cmtSubtotal = totalFabricCostPerPc + cmt + elastic + rope;

    const acc = costing.accessories;
    const accessoriesTotal = 
      (parseFloat(acc.mainLabel as string) || 0) + 
      (parseFloat(acc.washcareLabel as string) || 0) + 
      (parseFloat(acc.tag as string) || 0) + 
      (parseFloat(acc.thread as string) || 0) + 
      (parseFloat(acc.hoodRope as string) || 0) + 
      (parseFloat(acc.customAccessory as string) || 0);

    const pk = costing.packing;
    const packingTotal = 
      (parseFloat(pk.bow as string) || 0) + 
      (parseFloat(pk.elasticPacking as string) || 0) + 
      (parseFloat(pk.polyBag as string) || 0) + 
      (parseFloat(pk.courier as string) || 0) + 
      (parseFloat(pk.cartonBox as string) || 0) + 
      (parseFloat(pk.cartonBoxSticker as string) || 0) + 
      (parseFloat(pk.sizeSticker as string) || 0) + 
      (parseFloat(pk.transports as string) || 0) + 
      (parseFloat(pk.others as string) || 0);

    const subtotalPerPc = cmtSubtotal + accessoriesTotal + packingTotal;
    const lossPercent = parseFloat(costing.productionLossPercent as string) || 0;
    const productionLossAmount = subtotalPerPc * (lossPercent / 100);
    const totalCostPerPc = subtotalPerPc + productionLossAmount;

    const profitPercent = parseFloat(costing.profitPercent as string) || 0;
    const marginAmount = totalCostPerPc * (profitPercent / 100);
    const sellingPricePerPc = totalCostPerPc + marginAmount;

    return {
      fabrics: fabricsCalculated,
      totalFabricCostPerPc,
      cmtSubtotal,
      accessoriesTotal,
      packingTotal,
      subtotalPerPc,
      productionLossAmount,
      totalCostPerPc,
      marginAmount,
      sellingPricePerPc,
    };
  }, [costing]);

  const handleSaveCosting = () => {
    const calc = calculatedCosting;
    const totalYarnRate = costing.fabrics.reduce((sum, f) => sum + (parseFloat(f.yarnRate as string) || 0), 0);
    const totalKnittingRate = costing.fabrics.reduce((sum, f) => sum + (parseFloat(f.knittingRate as string) || 0), 0);
    const totalDyeingRate = costing.fabrics.reduce((sum, f) => sum + (parseFloat(f.dyeingRate as string) || 0), 0);
    const totalCompactingRate = costing.fabrics.reduce((sum, f) => sum + (parseFloat(f.compactingRate as string) || 0), 0);

    const cutting = parseFloat(costing.cmt_cutting as string) || 0;
    const singer = parseFloat(costing.cmt_singer as string) || 0;
    const powerTable = parseFloat(costing.cmt_powerTable as string) || 0;
    const checking = parseFloat(costing.cmt_checking as string) || 0;
    const ironingPacking = parseFloat(costing.cmt_ironingPacking as string) || 0;
    const computedCmt = cutting + singer + powerTable + checking + ironingPacking;
    const finalCmt = computedCmt > 0 ? computedCmt : (parseFloat(costing.cmt as string) || 0);

    updateCosting.mutate({
      orderId,
      yarnCost: totalYarnRate,
      knittingCost: totalKnittingRate,
      dyeingCost: totalDyeingRate,
      printingCost: 0,
      compactingCost: totalCompactingRate,
      cuttingCost: 0,
      stitchingCost: finalCmt,
      packingCost: calc.packingTotal,
      overheadPercent: 0,
      profitPercent: parseFloat(costing.profitPercent as string) || 0,
      totalCostPerPc: calc.totalCostPerPc,
      sellingPricePerPc: calc.sellingPricePerPc,
      remarks: costing.remarks,
      costingDetails: costing,
    });
  };

  const handlePrintPO = () => {
    const calc = calculatedCosting;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented opening the print window");
      return;
    }
    
    const fabricsRows = calc.fabrics.map((f) => {
      const netReq = (parseFloat(f.consumption as string) || 0) * orderQty;
      const loss = parseFloat(f.lossPercent as string) || 0;
      const grossReq = netReq * (1 + loss / 100);
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${f.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${f.consumption} Kg</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${netReq.toFixed(3)} Kg</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${loss}%</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${grossReq.toFixed(3)} Kg</td>
        </tr>
      `;
    }).join("");

    const cmtList = [
      { name: "Cutting Cost", val: costing.cmt_cutting },
      { name: "Singer Cost", val: costing.cmt_singer },
      { name: "Power Table Cost", val: costing.cmt_powerTable },
      { name: "Checking Cost", val: costing.cmt_checking },
      { name: "Ironing & Packing Cost", val: costing.cmt_ironingPacking },
      { name: "Elastic Cost", val: costing.elastic },
      { name: "Rope Cost", val: costing.rope },
    ].filter(item => parseFloat(item.val as string) > 0);

    const cmtRows = cmtList.map(item => {
      const rate = parseFloat(item.val as string) || 0;
      const totalCost = rate * orderQty;
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${orderQty} pcs</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${rate.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${totalCost.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const accessoriesList = [
      { name: "Main Label", val: costing.accessories.mainLabel },
      { name: "Washcare Label", val: costing.accessories.washcareLabel },
      { name: "Hang Tag", val: costing.accessories.tag },
      { name: "Thread", val: costing.accessories.thread },
      { name: "Hood Rope", val: costing.accessories.hoodRope },
      { name: "Other Trim/Acc", val: costing.accessories.customAccessory },
    ].filter(item => parseFloat(item.val as string) > 0);

    const accessoriesRows = accessoriesList.map(item => {
      const rate = parseFloat(item.val as string) || 0;
      const totalCost = rate * orderQty;
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${orderQty} pcs</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${rate.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${totalCost.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const packingList = [
      { name: "Bow", val: costing.packing.bow },
      { name: "Elastic Packing", val: costing.packing.elasticPacking },
      { name: "Poly Bag", val: costing.packing.polyBag },
      { name: "Courier / Other", val: costing.packing.courier },
      { name: "Carton Box", val: costing.packing.cartonBox },
      { name: "Carton Box Sticker", val: costing.packing.cartonBoxSticker },
      { name: "Size Sticker", val: costing.packing.sizeSticker },
      { name: "Transports", val: costing.packing.transports },
      { name: "Others", val: costing.packing.others },
    ].filter(item => parseFloat(item.val as string) > 0);

    const packingRows = packingList.map(item => {
      const rate = parseFloat(item.val as string) || 0;
      const totalCost = rate * orderQty;
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${orderQty} pcs</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${rate.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${totalCost.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
        <head>
          <title>PO Material Requirement Sheet - ${order.orderNo}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 20px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; border: 1px solid #ddd; font-size: 13px; }
            h1, h2, h3 { margin-bottom: 5px; }
            .header-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 15px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .section-title { background: #333; color: white; padding: 6px 10px; font-size: 14px; font-weight: bold; margin-top: 25px; text-transform: uppercase; }
            .footer-notes { margin-top: 40px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
            .sig-block { border-top: 1px dashed #999; margin-top: 50px; padding-top: 8px; text-align: center; }
            @media print {
              body { margin: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>VISTRAL ERP - MATERIAL PO PLANNER</h2>
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #111827; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print / Save PDF</button>
          </div>
          <div style="color: #666; font-size: 12px; margin-top: -10px;">Generated on: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}</div>
          
          <div class="header-info">
            <div>
               <p><strong>Order Number:</strong> ${order.orderNo}</p>
               <p><strong>Customer Name:</strong> ${order.customer?.name ?? "-"} ${order.companyName ? `(${order.companyName})` : ""}</p>
               <p><strong>Delivery Date:</strong> ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "-"}</p>
            </div>
            <div>
              <p><strong>Style Name:</strong> ${order.styleName ?? "-"}</p>
              <p><strong>Style Number:</strong> ${order.styleNo ?? "-"}</p>
              <p><strong>Total Order Quantity:</strong> ${orderQty} pcs</p>
            </div>
          </div>

          <div class="section-title">1. Fabric & Yarn Requirement</div>
          <table>
            <thead>
              <tr>
                <th>Fabric Description</th>
                <th style="text-align: center; width: 120px;">Pcs Weight (Kg)</th>
                <th style="text-align: center; width: 150px;">Net Required (Kg)</th>
                <th style="text-align: center; width: 100px;">Loss %</th>
                <th style="text-align: center; width: 150px;">Gross Required (Kg)</th>
              </tr>
            </thead>
            <tbody>
              ${fabricsRows || '<tr><td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #777;">No fabric requirements entered.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">2. CMT & Stitching Budget</div>
          <table>
            <thead>
              <tr>
                <th>Operation Name</th>
                <th style="text-align: center; width: 120px;">Total Qty Required</th>
                <th style="text-align: right; width: 150px;">Budget Rate / Pc</th>
                <th style="text-align: right; width: 180px;">Total Budgeted Amount</th>
              </tr>
            </thead>
            <tbody>
              ${cmtRows || '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #777;">No CMT operations budgeted.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">3. Accessories Requirement</div>
          <table>
            <thead>
              <tr>
                <th>Accessory Name</th>
                <th style="text-align: center; width: 120px;">Total Qty Required</th>
                <th style="text-align: right; width: 150px;">Budget Rate / Pc</th>
                <th style="text-align: right; width: 180px;">Total Budgeted Amount</th>
              </tr>
            </thead>
            <tbody>
              ${accessoriesRows || '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #777;">No accessory requirements budgeted.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">4. Packing Materials Requirement</div>
          <table>
            <thead>
              <tr>
                <th>Packing Material Description</th>
                <th style="text-align: center; width: 120px;">Total Qty Required</th>
                <th style="text-align: right; width: 150px;">Budget Rate / Pc</th>
                <th style="text-align: right; width: 180px;">Total Budgeted Amount</th>
              </tr>
            </thead>
            <tbody>
              ${packingRows || '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #777;">No packing requirements budgeted.</td></tr>'}
            </tbody>
          </table>

          <div class="footer-notes">
            <div>
              <h3>Remarks / Technical Instructions</h3>
              <p style="font-size: 13px; border: 1px solid #ccc; padding: 10px; background-color: #fafafa; min-height: 80px; border-radius: 4px;">
                ${costing.remarks ? costing.remarks.replace(/\n/g, '<br>') : "No custom technical instructions entered."}
              </p>
            </div>
            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
              <div class="sig-block">
                Prepared By (Merchant)
              </div>
              <div class="sig-block">
                Approved By (Production / Director)
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 pt-4">
        <div className="text-lg font-semibold text-[#111827]">Order not found</div>
        <p className="text-sm text-[#6B7280]">The requested order could not be loaded.</p>
        <Button onClick={() => router.push("/orders")}>Back to orders</Button>
      </div>
    );
  }

  const orderQty = order.quantity || 1;
  const totalOrderValue = calculatedCosting.sellingPricePerPc * orderQty;

  return (
    <div className="space-y-6 pt-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Order {order.orderNo}</h1>
          <p className="text-sm text-[#6B7280] mt-1">Order Details and Technical Costing Sheet</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/orders")}>Back to orders</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280]">Order No</p>
              <p className="font-semibold text-[#111827]">{order.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Status</p>
              <Badge variant={getOrderStatusVariant(order.status)} className="mt-1">
                {order.status}
              </Badge>
            </div>
            <div>
               <p className="text-xs text-[#6B7280]">Customer</p>
               <p className="font-medium text-[#111827]">{order.customer?.name ?? "-"} {order.companyName ? `(${order.companyName})` : ""}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Style Name</p>
              <p className="font-medium text-[#111827]">{order.styleName ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Style No</p>
              <p className="font-medium text-[#111827]">{order.styleNo ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Order Quantity</p>
              <p className="font-semibold text-[#111827]">{order.quantity} {order.unit}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Delivery Date</p>
              <p className="font-medium text-[#111827]">
                {order.deliveryDate ? formatDate(order.deliveryDate) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Items & Color Quantities</CardTitle>
          </CardHeader>
          <CardContent>
            {order.orderDetails.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No items added to this order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-[#6B7280]">Style No</th>
                      <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-[#6B7280]">Color</th>
                      <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-[#6B7280]">Unit Price</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">Total Qty</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">XS</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">S</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">M</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">L</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">XL</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">XXL</th>
                      <th className="px-3 py-2 text-center text-xs uppercase tracking-wide text-[#6B7280]">3XL</th>
                      <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-[#6B7280]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {order.orderDetails.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-3 py-2 font-medium">{detail.styleNo ?? "-"}</td>
                        <td className="px-3 py-2">{detail.color}</td>
                        <td className="px-3 py-2 text-right">{Number(detail.unitPrice).toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-center font-semibold">{detail.quantity}</td>
                        <td className="px-3 py-2 text-center">{detail.xs || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.s || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.m || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.l || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.xl || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.xxl || 0}</td>
                        <td className="px-3 py-2 text-center">{detail.xxxl || 0}</td>
                        <td className="px-3 py-2 text-right font-medium">{Number(detail.amount).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Costing Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fabric Costing Section */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 bg-[#F9FAFB] rounded-t-xl">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#111827]" />
                <CardTitle className="text-base font-semibold text-[#111827]">Fabric / Lot Costing (Per Kg)</CardTitle>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFabricRow}>
                <Plus className="h-4 w-4 mr-1" /> Add Fabric
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[#4B5563] font-medium uppercase">
                      <th className="p-3 font-semibold">Fabric Name</th>
                      <th className="p-3 w-40 font-semibold text-center">Items & Pcs</th>
                      <th className="p-3 w-16 text-center font-semibold">Yarn</th>
                      <th className="p-3 w-16 text-center font-semibold">Knit</th>
                      <th className="p-3 w-16 text-center font-semibold">Dye</th>
                      <th className="p-3 w-16 text-center font-semibold">Heatset</th>
                      <th className="p-3 w-16 text-center font-semibold">Center</th>
                      <th className="p-3 w-16 text-center font-semibold">Compact</th>
                      <th className="p-3 w-16 text-center font-semibold">Bio Wsh</th>
                      <th className="p-3 w-16 text-center font-semibold">Loss %</th>
                      <th className="p-3 w-20 text-center font-semibold">Rate/Kg</th>
                      <th className="p-3 w-24 text-center font-semibold">Pcs Weight</th>
                      <th className="p-3 w-20 text-right font-semibold">Cost/Pc</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {calculatedCosting.fabrics.map((fabric) => (
                      <tr key={fabric.id} className="hover:bg-gray-50">
                        <td className="p-2">
                          <Input
                            type="text"
                            value={fabric.name}
                            onChange={(e) => updateFabricField(fabric.id, "name", e.target.value)}
                            className="h-8 text-xs font-medium px-2 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                          />
                        </td>
                        <td className="p-2 w-40">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 w-full text-left px-2 justify-between font-normal text-xs border-gray-200 bg-white flex items-center"
                              >
                                <span className="truncate">
                                  {fabric.itemIds && fabric.itemIds.length > 0
                                    ? `${fabric.itemIds.length} items (${order?.orderDetails
                                        ? order.orderDetails
                                            .filter((d: any) => fabric.itemIds?.includes(d.id))
                                            .reduce((sum: number, d: any) => sum + d.quantity, 0)
                                        : 0} pcs)`
                                    : `All items (${order?.quantity} pcs)`}
                                </span>
                                <Plus className="h-3 w-3 ml-1 text-gray-400 shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                              <DropdownMenuLabel className="text-xs">Classify Fabric Items</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {order?.orderDetails.map((item) => {
                                const isChecked = (fabric.itemIds || []).includes(item.id);
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={item.id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentIds = fabric.itemIds || [];
                                      const updatedIds = checked
                                        ? [...currentIds, item.id]
                                        : currentIds.filter((id) => id !== item.id);
                                      updateFabricField(fabric.id, "itemIds", updatedIds);
                                    }}
                                    className="text-xs"
                                  >
                                    <span className="font-semibold text-gray-800">{item.styleNo || "Style"}</span>
                                    <span className="text-gray-500 ml-1">({item.color})</span>
                                    <span className="ml-auto font-bold text-[#111827]">{item.quantity}</span>
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.yarnRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "yarnRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.knittingRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "knittingRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.dyeingRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "dyeingRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.heatsettingRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "heatsettingRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.centeringRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "centeringRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.compactingRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "compactingRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.bioWashRate ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "bioWashRate", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.lossPercent ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "lossPercent", e.target.value)}
                            className="h-8 text-xs text-center px-1 py-0.5 border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-gray-400 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center font-medium text-gray-700">
                          {fabric.totalRatePerKg.toFixed(1)}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            value={fabric.consumption ?? ""}
                            onChange={(e) => updateFabricField(fabric.id, "consumption", e.target.value)}
                            className="h-8 text-xs text-center font-medium px-1 py-0.5 bg-yellow-50 border-yellow-200 shadow-none focus-visible:ring-1 focus-visible:ring-yellow-400 text-gray-900"
                            placeholder="0.000"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold text-[#111827]">
                          ₹{fabric.totalCostPerPc.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={costing.fabrics.length === 1}
                            onClick={() => removeFabricRow(fabric.id)}
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Cost Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Stitching / CMT Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="text-sm font-semibold text-gray-800">CMT & Stitching Cost</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">Total Stitching / CMT</span>
                    <span className="text-sm font-extrabold text-[#111827]">₹{(calculatedCosting.cmtSubtotal - calculatedCosting.totalFabricCostPerPc - (parseFloat(costing.elastic as string) || 0) - (parseFloat(costing.rope as string) || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-gray-200">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Cutting Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.cmt_cutting ?? ""}
                      onChange={(e) => updateCostingField("cmt_cutting", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Singer Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.cmt_singer ?? ""}
                      onChange={(e) => updateCostingField("cmt_singer", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Power Table</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.cmt_powerTable ?? ""}
                      onChange={(e) => updateCostingField("cmt_powerTable", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Checking Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.cmt_checking ?? ""}
                      onChange={(e) => updateCostingField("cmt_checking", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-medium">Ironing & Packing Cost</label>
                  <Input
                    type="number"
                    step="any"
                    value={costing.cmt_ironingPacking ?? ""}
                    onChange={(e) => updateCostingField("cmt_ironingPacking", e.target.value)}
                    className="h-8 text-xs mt-1 py-0.5"
                    placeholder="0"
                  />
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Elastic Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.elastic ?? ""}
                      onChange={(e) => updateCostingField("elastic", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Rope Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.rope ?? ""}
                      onChange={(e) => updateCostingField("rope", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessories Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="text-sm font-semibold text-gray-800">Accessories Cost</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Main Label</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.accessories.mainLabel ?? ""}
                      onChange={(e) => updateAccessoryField("mainLabel", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Washcare Lbl</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.accessories.washcareLabel ?? ""}
                      onChange={(e) => updateAccessoryField("washcareLabel", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Hang Tag</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.accessories.tag ?? ""}
                      onChange={(e) => updateAccessoryField("tag", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Thread Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.accessories.thread ?? ""}
                      onChange={(e) => updateAccessoryField("thread", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Hood Rope / Other Trims</label>
                  <Input
                    type="number"
                    step="any"
                    value={costing.accessories.hoodRope ?? ""}
                    onChange={(e) => updateAccessoryField("hoodRope", e.target.value)}
                    className="h-8 text-xs mt-1 py-0.5"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Other Accessory Cost</label>
                  <Input
                    type="number"
                    step="any"
                    value={costing.accessories.customAccessory ?? ""}
                    onChange={(e) => updateAccessoryField("customAccessory", e.target.value)}
                    className="h-8 text-xs mt-1 py-0.5"
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Packing Materials Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="text-sm font-semibold text-gray-800">Packing & Transport</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Bow Cost</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.bow ?? ""}
                      onChange={(e) => updatePackingField("bow", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Poly Bag</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.polyBag ?? ""}
                      onChange={(e) => updatePackingField("polyBag", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Carton Box</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.cartonBox ?? ""}
                      onChange={(e) => updatePackingField("cartonBox", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Size Sticker</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.sizeSticker ?? ""}
                      onChange={(e) => updatePackingField("sizeSticker", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Transports</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.transports ?? ""}
                      onChange={(e) => updatePackingField("transports", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Courier/Other</label>
                    <Input
                      type="number"
                      step="any"
                      value={costing.packing.courier ?? ""}
                      onChange={(e) => updatePackingField("courier", e.target.value)}
                      className="h-8 text-xs mt-1 py-0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Costing Summary Dashboard */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <Card className="border-2 border-[#111827] shadow-lg rounded-xl overflow-hidden">
              <div className="bg-[#111827] px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-white" />
                  <h3 className="font-bold text-base tracking-wide">Costing & Margins Summary</h3>
                </div>
                <p className="text-xs text-gray-300 mt-1">Calculations updated automatically in real-time</p>
              </div>

              <CardContent className="p-6 space-y-5 bg-white">
                {/* Visual Dashboard blocks */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Fabrics</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">₹{calculatedCosting.totalFabricCostPerPc.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Accessories</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">₹{calculatedCosting.accessoriesTotal.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Packing</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">₹{calculatedCosting.packingTotal.toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Stitching & CMT Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{calculatedCosting.cmtSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Est. Material Cost (Subtotal)</span>
                    <span className="font-semibold text-gray-800">₹{calculatedCosting.subtotalPerPc.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 font-medium">Production Loss</span>
                      <div className="flex items-center bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <Input
                          type="number"
                          step="any"
                          value={costing.productionLossPercent ?? ""}
                          onChange={(e) => updateCostingField("productionLossPercent", e.target.value)}
                          className="w-8 h-4 text-[10px] border-0 p-0 text-center bg-transparent focus:ring-0 font-bold"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800">+ ₹{calculatedCosting.productionLossAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-gray-200">
                    <span className="text-gray-600 font-semibold">Total Cost per Pc</span>
                    <span className="font-bold text-gray-900">₹{calculatedCosting.totalCostPerPc.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 font-medium">Profit Margin</span>
                      <div className="flex items-center bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <Input
                          type="number"
                          step="any"
                          value={costing.profitPercent ?? ""}
                          onChange={(e) => updateCostingField("profitPercent", e.target.value)}
                          className="w-8 h-4 text-[10px] border-0 p-0 text-center bg-transparent focus:ring-0 font-bold"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">+ ₹{calculatedCosting.marginAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Final Rate highlight block */}
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Target rate per pc</span>
                    <span className="text-xl font-extrabold text-[#111827]">₹{Math.round(calculatedCosting.sellingPricePerPc)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Total Order Value ({orderQty} pcs)</span>
                    <span className="font-bold text-gray-800">₹{Math.round(totalOrderValue).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Technical Remarks / Notes</label>
                  <Textarea
                    rows={3}
                    value={costing.remarks}
                    onChange={(e) => updateCostingField("remarks", e.target.value)}
                    className="text-xs"
                    placeholder="E.g. Lycra Jersey fabric with 240 GSM, white color..."
                  />
                </div>

                <Button
                  onClick={handleSaveCosting}
                  loading={updateCosting.isPending}
                  className="w-full bg-[#111827] hover:bg-black text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 text-sm shadow-md transition-all duration-150 mt-2"
                >
                  <Save className="h-4 w-4" /> Save Costing Sheet
                </Button>

                <Button
                  onClick={handlePrintPO}
                  variant="outline"
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm shadow-sm transition-all duration-150 mt-2"
                >
                  <FileText className="h-4 w-4 text-red-600" /> Save PO & Requirements as PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

