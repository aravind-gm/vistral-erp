import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderDetailSchema = z.object({
  fabricTypeId: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  size: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  gsm: z.number().optional(),
  composition: z.string().optional(),
  remarks: z.string().optional(),
});

const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  buyerOrderNo: z.string().optional(),
  styleNo: z.string().optional(),
  styleName: z.string().optional(),
  season: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(1, "Quantity is required"),
  unit: z.string().default("PCS"),
  orderDate: z.date().default(() => new Date()),
  deliveryDate: z.date().optional(),
  shipmentDate: z.date().optional(),
  portOfLoading: z.string().optional(),
  portOfDestination: z.string().optional(),
  paymentTerms: z.string().optional(),
  incoterms: z.string().optional(),
  currency: z.string().default("INR"),
  exchangeRate: z.number().default(1),
  remarks: z.string().optional(),
  details: z.array(orderDetailSchema).min(1, "At least one detail is required"),
});

const listInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  customerId: z.string().optional(),
});

export const ordersRouter = createTRPCRouter({
  list: protectedProcedure.input(listInput).query(async ({ input }) => {
    const { page, limit, search, status, customerId } = input;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(status && { status: status as never }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { orderNo: { contains: search, mode: "insensitive" as const } },
          { buyerOrderNo: { contains: search, mode: "insensitive" as const } },
          { styleNo: { contains: search, mode: "insensitive" as const } },
          { styleName: { contains: search, mode: "insensitive" as const } },
          { customer: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNo: true,
          buyerOrderNo: true,
          styleName: true,
          status: true,
          quantity: true,
          unit: true,
          orderDate: true,
          deliveryDate: true,
          createdAt: true,
          customer: { select: { name: true, code: true } },
          orderCosting: { select: { id: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const order = await prisma.order.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          customer: true,
          orderDetails: {
            include: { fabricType: true },
          },
          orderCosting: true,
          yarnPlans: {
            include: { yarnType: true },
          },
          productionBatches: {
            include: {
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
          },
          documents: true,
        },
      });
      if (!order) throw new Error("Order not found");
      return order;
    }),

  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { details, ...orderData } = input;
      const count = await prisma.order.count();
      const year = new Date().getFullYear().toString().slice(-2);
      const orderNo = `ORD-${year}-${String(count + 1).padStart(5, "0")}`;

      const order = await prisma.order.create({
        data: {
          ...orderData,
          orderNo,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
          orderDetails: {
            create: details.map((d) => ({
              ...d,
              createdBy: ctx.session.user.id,
              updatedBy: ctx.session.user.id,
            })),
          },
        },
        include: { orderDetails: true },
      });

      await prisma.orderCosting.create({
        data: {
          orderId: order.id,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
        },
      });

      return order;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum([
        "ENQUIRY", "QUOTATION_SENT", "PO_RECEIVED", "CONFIRMED",
        "IN_PRODUCTION", "DISPATCHED", "INVOICED", "PAYMENT_RECEIVED", "CANCELLED"
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.order.update({
        where: { id: input.id },
        data: {
          status: input.status,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  updateCosting: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      yarnCost: z.number().min(0).optional(),
      knittingCost: z.number().min(0).optional(),
      dyeingCost: z.number().min(0).optional(),
      printingCost: z.number().min(0).optional(),
      compactingCost: z.number().min(0).optional(),
      cuttingCost: z.number().min(0).optional(),
      stitchingCost: z.number().min(0).optional(),
      packingCost: z.number().min(0).optional(),
      overheadPercent: z.number().min(0).max(100).optional(),
      profitPercent: z.number().min(0).max(100).optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const costing = await prisma.orderCosting.upsert({
        where: { orderId: input.orderId },
        create: {
          orderId: input.orderId,
          yarnCost: input.yarnCost ?? 0,
          knittingCost: input.knittingCost ?? 0,
          dyeingCost: input.dyeingCost ?? 0,
          printingCost: input.printingCost ?? 0,
          compactingCost: input.compactingCost ?? 0,
          cuttingCost: input.cuttingCost ?? 0,
          stitchingCost: input.stitchingCost ?? 0,
          packingCost: input.packingCost ?? 0,
          overheadPercent: input.overheadPercent ?? 10,
          profitPercent: input.profitPercent ?? 15,
          totalCostPerPc: 0,
          sellingPricePerPc: 0,
          totalOrderValue: 0,
          remarks: input.remarks,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
        },
        update: {
          yarnCost: input.yarnCost ?? undefined,
          knittingCost: input.knittingCost ?? undefined,
          dyeingCost: input.dyeingCost ?? undefined,
          printingCost: input.printingCost ?? undefined,
          compactingCost: input.compactingCost ?? undefined,
          cuttingCost: input.cuttingCost ?? undefined,
          stitchingCost: input.stitchingCost ?? undefined,
          packingCost: input.packingCost ?? undefined,
          overheadPercent: input.overheadPercent ?? undefined,
          profitPercent: input.profitPercent ?? undefined,
          remarks: input.remarks ?? undefined,
          updatedBy: ctx.session.user.id,
        },
      });

      return costing;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.order.update({
        where: { id: input.id },
        data: { deletedAt: new Date(), updatedBy: ctx.session.user.id },
      });
    }),
});
