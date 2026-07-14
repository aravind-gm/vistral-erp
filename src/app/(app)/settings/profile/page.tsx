"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="pt-4">Loading profile...</div>;
  }

  if (!session?.user) {
    router.replace("/login");
    return null;
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Profile</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage your account details and sign out.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-[#111827] text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-[#111827]">{session.user.name}</p>
              <p className="text-sm text-[#6B7280]">{session.user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[#6B7280]">Role</p>
              <p className="font-medium text-[#111827]">{session.user.role ?? "User"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">User ID</p>
              <p className="font-mono text-[#111827]">{session.user.id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push("/settings")}>Settings</Button>
            <Button variant="destructive" onClick={async () => { await signOut(); router.push("/login"); }}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

