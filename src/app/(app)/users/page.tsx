"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Shield, Users } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function UsersPage() {
  const { data, isLoading, refetch } = api.users.list.useQuery({ page: 1, limit: 50 });

  const toggleActive = api.users.toggleActive.useMutation({
    onSuccess: () => { toast.success("User updated"); void refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const updateRole = api.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); void refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Access</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their roles</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({data?.meta.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.data.map((user: typeof data.data[number]) => (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {user.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name ?? "—"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize">
                      {user.role ?? "staff"}
                    </Badge>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateRole.mutate({ id: user.id, role: "ADMIN" })}>
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRole.mutate({ id: user.id, role: "GENERAL_MANAGER" })}>
                          Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRole.mutate({ id: user.id, role: "ACCOUNTS" })}>
                          Make Accounts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRole.mutate({ id: user.id, role: "PRODUCTION" })}>
                          Make Production
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={user.isActive ? "text-red-600" : "text-green-600"}
                          onClick={() => toggleActive.mutate({ id: user.id, isActive: !user.isActive })}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
