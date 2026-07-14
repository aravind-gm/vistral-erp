"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Users</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage system users and access levels.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/users") }>
            <ArrowLeft className="h-4 w-4 mr-2" /> Users
          </Button>
          <Button onClick={() => router.push("/users") }>
            <Users className="h-4 w-4 mr-2" /> Open Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563]">
            Manage user accounts and roles. Use the button above to return to the users overview.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

