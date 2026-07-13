export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getOrderStatusVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
    ENQUIRY: "outline",
    QUOTATION_SENT: "secondary",
    PO_RECEIVED: "warning",
    CONFIRMED: "default",
    IN_PRODUCTION: "warning",
    DISPATCHED: "success",
    INVOICED: "default",
    PAYMENT_RECEIVED: "success",
    CANCELLED: "destructive",
  };
  return map[status] ?? "secondary";
}
