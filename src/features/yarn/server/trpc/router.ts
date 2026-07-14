import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const yarnTypeSchema = z.object({
  name: z.string().min(1),
  count: z.string().min(1),
  composition: z.string().min(1),
  ply: z.number().min(1).default(1),
  unit: z.string().default("KG"),
  hsn: z.string().optional(),
});

const procurementSchema = z.object({
  orderId: z.string().optional(),
  supplierId: z.string().min(1),
  expectedDate: z.date().optional(),
  remarks: z.string().optional(),
  items: z.array(z.object({
    yarnTypeId: z.string().min(1),
    quantity: z.number().min(0.001),
    unit: z.string().default("KG"),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
    hsn: z.string().optional(),
    gstPercent: z.number().min(0).max(100).default(5),
  })).min(1),
});

const inventoryCreateSchema = z.object({
  yarnTypeId: z.string().min(1),
  supplierId: z.string().optional(),
  lotNo: z.string().optional(),
  quantity: z.number().min(0.001),
  unit: z.string().default("KG"),
  location: z.string().optional(),
  reorderLevel: z.number().min(0).default(0),
  remarks: z.string().optional(),
});

export const yarnRouter = createTRPCRouter({
  // Yarn Types
  listTypes: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return prisma.yarnType.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          ...(input?.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" as const } },
              { count: { contains: input.search, mode: "insensitive" as const } },
            ],
          }),
        },
        orderBy: { name: "asc" },
      });
    }),

  createType: protectedProcedure
    .input(yarnTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.yarnType.count();
      const code = `YARN-${String(count + 1).padStart(4, "0")}`;
      return prisma.yarnType.create({
        data: { ...input, code, createdBy: ctx.session.user.id, updatedBy: ctx.session.user.id },
      });
    }),

  // Procurement
  listProcurements: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, search, status } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(status && { status: status as never }),
        ...(search && {
          OR: [
            { poNo: { contains: search, mode: "insensitive" as const } },
            { supplier: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.yarnProcurement.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            supplier: { select: { name: true, code: true } },
            items: { include: { yarnType: { select: { name: true, count: true } } } },
          },
        }),
        prisma.yarnProcurement.count({ where }),
      ]);

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }),

  createProcurement: protectedProcedure
    .input(procurementSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...data } = input;
      const count = await prisma.yarnProcurement.count();
      const year = new Date().getFullYear().toString().slice(-2);
      const poNo = `YPO-${year}-${String(count + 1).padStart(5, "0")}`;

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      return prisma.yarnProcurement.create({
        data: {
          ...data,
          poNo,
          totalAmount,
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

  createInventory: protectedProcedure
    .input(inventoryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { quantity, ...data } = input;
      return prisma.yarnInventory.create({
        data: {
          ...data,
          currentStock: quantity,
          reservedStock: 0,
          availableStock: quantity,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
          transactions: {
            create: {
              type: "RECEIPT",
              referenceType: "MANUAL_ADDITION",
              quantity,
              balanceAfter: quantity,
              remarks: input.remarks,
              createdBy: ctx.session.user.id,
              updatedBy: ctx.session.user.id,
            },
          },
        },
      });
    }),

  // Inventory
  getInventory: protectedProcedure.query(async () => {
    return prisma.yarnInventory.findMany({
      include: {
        yarnType: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
