"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Enter a valid phone number"),
  altPhone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Enter valid pincode"),
  country: z.string().default("India"),
  creditLimit: z.coerce.number().min(0).default(0),
  creditDays: z.coerce.number().min(0).default(30),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

export function CustomerDialog({ open, onOpenChange, onSuccess }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      country: "India",
      creditLimit: 0,
      creditDays: 30,
    },
  });

  const createMutation = api.customers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Customer created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.(data);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create customer");
    },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Company Name *</Label>
              <Input {...form.register("name")} placeholder="e.g. ABC Garments Pvt Ltd" />
              {form.formState.errors.name && (
                <p className="text-xs text-[#DC2626]">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input {...form.register("contactPerson")} placeholder="Full name" />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...form.register("email")} type="email" placeholder="email@company.com" />
              {form.formState.errors.email && (
                <p className="text-xs text-[#DC2626]">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input {...form.register("phone")} placeholder="+91 98765 43210" />
              {form.formState.errors.phone && (
                <p className="text-xs text-[#DC2626]">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Alternate Phone</Label>
              <Input {...form.register("altPhone")} placeholder="+91 98765 43210" />
            </div>
          </div>

          {/* GST & PAN */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>GSTIN</Label>
              <Input
                {...form.register("gstin")}
                placeholder="22AAAAA0000A1Z5"
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label>PAN</Label>
              <Input
                {...form.register("pan")}
                placeholder="AAAAA0000A"
                className="font-mono uppercase"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Address Line 1 *</Label>
              <Input {...form.register("addressLine1")} placeholder="Street / Road" />
              {form.formState.errors.addressLine1 && (
                <p className="text-xs text-[#DC2626]">{form.formState.errors.addressLine1.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Address Line 2</Label>
              <Input {...form.register("addressLine2")} placeholder="Area / Landmark" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input {...form.register("city")} placeholder="City" />
                {form.formState.errors.city && (
                  <p className="text-xs text-[#DC2626]">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>State *</Label>
                <Input {...form.register("state")} placeholder="Tamil Nadu" />
                {form.formState.errors.state && (
                  <p className="text-xs text-[#DC2626]">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Pincode *</Label>
                <Input {...form.register("pincode")} placeholder="641001" className="font-mono" />
                {form.formState.errors.pincode && (
                  <p className="text-xs text-[#DC2626]">{form.formState.errors.pincode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Credit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Credit Limit (₹)</Label>
              <Input
                {...form.register("creditLimit")}
                type="number"
                placeholder="0"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Credit Days</Label>
              <Input
                {...form.register("creditDays")}
                type="number"
                placeholder="30"
                className="font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Optional notes..." rows={2} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
