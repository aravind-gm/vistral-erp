"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Roles</h1>
          <p className="text-sm text-[#6B7280] mt-1">Configure user roles and permissions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/users") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Users
          </Button>
          <Button onClick={() => router.push("/users") }>
            <UserCheck className="h-4 w-4 mr-2" /> Open Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Set up roles and access levels. Use the button above to return to user management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

