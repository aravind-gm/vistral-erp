import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#111827] text-white",
    secondary: "bg-[#F3F4F6] text-[#374151]",
    success: "bg-[#DCFCE7] text-[#166534]",
    warning: "bg-[#FEF3C7] text-[#92400E]",
    destructive: "bg-[#FEE2E2] text-[#991B1B]",
    outline: "border border-[#E5E7EB] text-[#374151]",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
