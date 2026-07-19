"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Factory, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@vistral.in", password: "Admin@123" },
  });

  async function onSubmit(values: LoginForm) {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827]">
            <Factory className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#111827]">Vistral ERP</h1>
            <p className="text-sm text-[#6B7280]">Textile Manufacturing Platform</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the ERP</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 relative"
              autoComplete="on"
            >

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  startIcon={<Mail className="h-4 w-4" />}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  startIcon={<Lock className="h-4 w-4" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#6B7280] hover:text-[#374151]"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-[#DC2626]">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
              >
                Sign in
              </Button>
            </form>
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#6B7280]">
              Test login: admin@vistral.in / Admin@123
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          Vistral ERP &copy; {new Date().getFullYear()} — Tiruppur
        </p>
      </div>
    </div>
  );
}
