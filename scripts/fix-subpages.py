from pathlib import Path

pages = [
    {'path':'src/app/(app)/orders/costing/page.tsx','title':'Order Costing','description':'Manage order costing details and estimates.','back':'/orders','action_label':'View Orders','action_href':'/orders'},
    {'path':'src/app/(app)/purchase/page.tsx','title':'Purchase Orders','description':'Create and track purchase orders for materials.','back':'/suppliers','action_label':'View Suppliers','action_href':'/suppliers'},
    {'path':'src/app/(app)/reports/page.tsx','title':'Reports','description':'View business reports and analytics.','back':'/dashboard','action_label':'Back to Dashboard','action_href':'/dashboard'},
    {'path':'src/app/(app)/yarn/planning/page.tsx','title':'Yarn Planning','description':'Plan yarn requirements and allocation.','back':'/yarn','action_label':'View Yarn Overview','action_href':'/yarn'},
    {'path':'src/app/(app)/yarn/procurement/page.tsx','title':'Yarn Procurement','description':'Create and track yarn procurement orders.','back':'/yarn','action_label':'View Yarn Inventory','action_href':'/yarn'},
    {'path':'src/app/(app)/yarn/inventory/page.tsx','title':'Yarn Inventory','description':'Review current yarn inventory and reorder status.','back':'/yarn','action_label':'View Yarn Overview','action_href':'/yarn'},
    {'path':'src/app/(app)/production/knitting/page.tsx','title':'Knitting','description':'Track knitting jobs and batch progress.','back':'/production','action_label':'New Batch','action_href':'/production'},
    {'path':'src/app/(app)/production/grey-fabric/page.tsx','title':'Grey Fabric','description':'Manage grey fabric processing and quality.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/dyeing/page.tsx','title':'Dyeing','description':'Monitor dyeing operations and schedules.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/printing/page.tsx','title':'Printing','description':'Track fabric printing jobs and timelines.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/compacting/page.tsx','title':'Compacting','description':'Manage compacting and finishing stages.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/checking/page.tsx','title':'Checking / QC','description':'Review quality checks and defects.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/cutting/page.tsx','title':'Cutting','description':'Track cutting jobs and materials.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/stitching/page.tsx','title':'Stitching','description':'Monitor stitching and garment assembly.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/packing/page.tsx','title':'Packing','description':'Manage packing, labels, and dispatch prep.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/production/dispatch/page.tsx','title':'Dispatch','description':'Track dispatches and shipment readiness.','back':'/production','action_label':'View Production','action_href':'/production'},
    {'path':'src/app/(app)/finance/invoices/page.tsx','title':'Invoices','description':'Manage invoices and billings.','back':'/finance','action_label':'Back to Finance','action_href':'/finance'},
    {'path':'src/app/(app)/finance/payments/page.tsx','title':'Payments','description':'Record customer payments and receipts.','back':'/finance','action_label':'Back to Finance','action_href':'/finance'},
    {'path':'src/app/(app)/finance/gst/page.tsx','title':'GST Reports','description':'View GST summaries and tax reports.','back':'/finance','action_label':'Back to Finance','action_href':'/finance'},
    {'path':'src/app/(app)/settings/company/page.tsx','title':'Company','description':'Configure company profile and contact details.','back':'/settings','action_label':'Open Settings','action_href':'/settings'},
    {'path':'src/app/(app)/settings/users/page.tsx','title':'Users','description':'Manage user accounts and access roles.','back':'/users','action_label':'View Users','action_href':'/users'},
    {'path':'src/app/(app)/settings/roles/page.tsx','title':'Roles','description':'Manage role permissions and access levels.','back':'/users','action_label':'Open Users','action_href':'/users'},
    {'path':'src/app/(app)/settings/yarn-types/page.tsx','title':'Yarn Types','description':'Manage yarn categories and specifications.','back':'/yarn','action_label':'Open Yarn','action_href':'/yarn'},
]

template = '''"use client";

import {{ useRouter }} from "next/navigation";
import {{ Button }} from "@/components/ui/button";
import {{ Card, CardContent, CardHeader, CardTitle }} from "@/components/ui/card";
import {{ Plus, ArrowLeft }} from "lucide-react";

export default function Page() {{
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("{back}") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={() => router.push("{action_href}") }>
            <Plus className="h-4 w-4 mr-2" /> {action_label}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#4B5563]">{description} Use the buttons above to navigate to related working pages.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Status</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">Ready</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Last update</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">Just now</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Actions</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}}
'''

for p in pages:
    path = Path(p['path'])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(template.format(**p), encoding='utf-8')
print(f'updated {len(pages)} pages')
