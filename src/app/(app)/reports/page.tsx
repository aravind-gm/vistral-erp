import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">View business reports and analytics.</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { title: "Sales Summary", description: "Monthly sales and order analytics", icon: TrendingUp },
          { title: "Inventory Status", description: "Current stock and procurement overview", icon: BarChart3 },
          { title: "Customer Activity", description: "Recent customer and order engagement", icon: FileText },
        ].map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <report.icon className="h-5 w-5 text-[#111827]" />
                <CardTitle>{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6B7280]">{report.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
