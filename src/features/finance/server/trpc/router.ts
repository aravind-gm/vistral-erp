import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  hsn: z.string().optional(),
  quantity: z.number().min(0),
  unit: z.string(),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  gstPercent: z.number().min(0).max(100).default(5),
  cgstAmount: z.number().default(0),
  sgstAmount: z.number().default(0),
  igstAmount: z.number().default(0),
  totalAmount: z.number().min(0),
});

const createInvoiceSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().min(1),
  invoiceDate: z.date().default(() => new Date()),
  dueDate: z.date().optional(),
  gstType: z.enum(["CGST_SGST", "IGST"]).default("CGST_SGST"),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  taxableAmount: z.number().min(0),
  cgst: z.number().min(0).default(0),
  sgst: z.number().min(0).default(0),
  igst: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  remarks: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  paymentDate: z.date().default(() => new Date()),
  amount: z.number().min(0.01),
  paymentMode: z.enum(["CASH", "CHEQUE", "NEFT", "RTGS", "UPI"]),
  referenceNo: z.string().optional(),
  bankName: z.string().optional(),
  remarks: z.string().optional(),
});

export const financeRouter = createTRPCRouter({
  listInvoices: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
      paymentStatus: z.string().optional(),
      customerId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, search, status, paymentStatus, customerId } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(status && { status: status as never }),
        ...(paymentStatus && { paymentStatus: paymentStatus as never }),
        ...(customerId && { customerId }),
        ...(search && {
          OR: [
            { invoiceNo: { contains: search, mode: "insensitive" as const } },
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true, code: true } },
          },
        }),
        prisma.invoice.count({ where }),
      ]);

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }),

  createInvoice: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...invoiceData } = input;
      const count = await prisma.invoice.count();
      const year = new Date().getFullYear().toString().slice(-2);
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      const invoiceNo = `INV-${year}${month}-${String(count + 1).padStart(5, "0")}`;

      return prisma.invoice.create({
        data: {
          ...invoiceData,
          invoiceNo,
          balanceAmount: invoiceData.totalAmount,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
          items: {
            create: items.map((item) => ({
              ...item,
              createdBy: ctx.session.user.id,
              updatedBy: ctx.session.user.id,
            })),
          },
        },
        include: { items: true },
      });
    }),

  recordPayment: protectedProcedure
    .input(paymentSchema)
    .mutation(async ({ ctx, input }) => {
      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: input.invoiceId },
      });

      const newPaidAmount = Number(invoice.paidAmount) + input.amount;
      const newBalance = Number(invoice.totalAmount) - newPaidAmount;
      const paymentStatus = newBalance <= 0 ? "PAID" : "PARTIAL";

      const [payment] = await prisma.$transaction([
        prisma.payment.create({
          data: {
            ...input,
            createdBy: ctx.session.user.id,
            updatedBy: ctx.session.user.id,
          },
        }),
        prisma.invoice.update({
          where: { id: input.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: Math.max(0, newBalance),
            paymentStatus: paymentStatus as never,
            updatedBy: ctx.session.user.id,
          },
        }),
      ]);

      return payment;
    }),

  getGSTReport: protectedProcedure
    .input(z.object({
      fromDate: z.date(),
      toDate: z.date(),
    }))
    .query(async ({ input }) => {
      const invoices = await prisma.invoice.findMany({
        where: {
          deletedAt: null,
          invoiceDate: { gte: input.fromDate, lte: input.toDate },
          status: { not: "CANCELLED" },
        },
        include: {
          customer: { select: { name: true, gstin: true, state: true } },
          items: true,
        },
        orderBy: { invoiceDate: "asc" },
      });

      type InvRow = typeof invoices[number];
      const totalCGST = invoices.reduce((s: number, inv: InvRow) => s + Number(inv.cgst), 0);
      const totalSGST = invoices.reduce((s: number, inv: InvRow) => s + Number(inv.sgst), 0);
      const totalIGST = invoices.reduce((s: number, inv: InvRow) => s + Number(inv.igst), 0);
      const totalTaxable = invoices.reduce((s: number, inv: InvRow) => s + Number(inv.taxableAmount), 0);

      return {
        invoices,
        summary: { totalCGST, totalSGST, totalIGST, totalTaxable, totalTax: totalCGST + totalSGST + totalIGST },
      };
    }),

  listPayments: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.payment.findMany({
          skip,
          take: limit,
          orderBy: { paymentDate: "desc" },
          include: {
            invoice: {
              include: {
                customer: { select: { name: true } },
              },
            },
          },
        }),
        prisma.payment.count(),
      ]);

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }),
});
