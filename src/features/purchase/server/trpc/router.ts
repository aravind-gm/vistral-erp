import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const purchaseOrderItemSchema = z.object({
  itemName: z.string().min(1),
  itemCode: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(0.001),
  unit: z.string(),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  hsn: z.string().optional(),
  gstPercent: z.number().min(0).max(100).default(18),
});

const createPOSchema = z.object({
  supplierId: z.string().min(1),
  expectedDate: z.date().optional(),
  remarks: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
});

export const purchaseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(search && {
          OR: [
            { poNo: { contains: search, mode: "insensitive" as const } },
            { supplier: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            supplier: { select: { name: true, code: true } },
          },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const po = await prisma.purchaseOrder.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          supplier: true,
          items: true,
        },
      });
      if (!po) throw new Error("Purchase order not found");
      return po;
    }),

  create: protectedProcedure
    .input(createPOSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...poData } = input;
      const count = await prisma.purchaseOrder.count();
      const year = new Date().getFullYear().toString().slice(-2);
      const poNo = `MPO-${year}-${String(count + 1).padStart(5, "0")}`;

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      return prisma.purchaseOrder.create({
        data: {
          ...poData,
          poNo,
          totalAmount,
          status: "DRAFT",
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

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["DRAFT", "APPROVED", "RECEIVED", "CANCELLED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        status: input.status,
        updatedBy: ctx.session.user.id,
      };
      if (input.status === "APPROVED") {
        updateData.approvedBy = ctx.session.user.id;
        updateData.approvedAt = new Date();
      }
      return prisma.purchaseOrder.update({
        where: { id: input.id },
        data: updateData,
      });
    }),
});
