import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]);

export const productionRouter = createTRPCRouter({
  listBatches: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: batchStatusEnum.optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, search, status } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(status && { status }),
        ...(search && {
          OR: [
            { batchNo: { contains: search, mode: "insensitive" as const } },
            { order: { orderNo: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.productionBatch.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            order: {
              select: { orderNo: true, styleName: true, customer: { select: { name: true } } },
            },
            knitting: { select: { status: true } },
            dyeingProcess: { select: { status: true } },
            stitching: { select: { status: true } },
            packing: { select: { status: true } },
            dispatch: { select: { dispatchNo: true } },
          },
        }),
        prisma.productionBatch.count({ where }),
      ]);

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }),

  createBatch: protectedProcedure
    .input(z.object({
      orderId: z.string().min(1),
      quantity: z.number().min(1),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.productionBatch.count();
      const year = new Date().getFullYear().toString().slice(-2);
      const batchNo = `BATCH-${year}-${String(count + 1).padStart(5, "0")}`;

      return prisma.productionBatch.create({
        data: {
          ...input,
          batchNo,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  updateKnitting: protectedProcedure
    .input(z.object({
      batchId: z.string(),
      machineNo: z.string().optional(),
      gaugeNo: z.string().optional(),
      diameter: z.number().optional(),
      gsm: z.number().optional(),
      yarnIssued: z.number().optional(),
      fabricProduced: z.number().optional(),
      wastage: z.number().optional(),
      status: batchStatusEnum.optional(),
      startDate: z.date().optional(),
      completedDate: z.date().optional(),
      operatorName: z.string().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { batchId, ...data } = input;
      return prisma.knittingProcess.upsert({
        where: { batchId },
        create: { batchId, ...data, createdBy: ctx.session.user.id, updatedBy: ctx.session.user.id },
        update: { ...data, updatedBy: ctx.session.user.id },
      });
    }),

  updateDyeing: protectedProcedure
    .input(z.object({
      batchId: z.string(),
      color: z.string().min(1),
      shade: z.string().optional(),
      recipe: z.string().optional(),
      isInHouse: z.boolean().default(true),
      subcontractorId: z.string().optional(),
      fabricIn: z.number().optional(),
      fabricOut: z.number().optional(),
      status: batchStatusEnum.optional(),
      costPerKg: z.number().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { batchId, ...data } = input;
      return prisma.dyeingProcess.upsert({
        where: { batchId },
        create: { batchId, ...data, createdBy: ctx.session.user.id, updatedBy: ctx.session.user.id },
        update: { ...data, updatedBy: ctx.session.user.id },
      });
    }),

  getBatchById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.productionBatch.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          order: {
            include: { customer: true, orderDetails: { include: { fabricType: true } } },
          },
          knitting: true,
          greyFabric: true,
          dyeingProcess: true,
          printingProcess: true,
          compacting: true,
          checking: true,
          cutting: true,
          stitching: true,
          packing: true,
          dispatch: true,
        },
      });
    }),
});
