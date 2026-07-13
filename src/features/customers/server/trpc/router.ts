import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  altPhone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  country: z.string().default("India"),
  creditLimit: z.number().min(0).default(0),
  creditDays: z.number().min(0).default(30),
  notes: z.string().optional(),
});

const listInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const customersRouter = createTRPCRouter({
  list: protectedProcedure.input(listInput).query(async ({ input }) => {
    const { page, limit, search, isActive } = input;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          name: true,
          contactPerson: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          gstin: true,
          creditLimit: true,
          creditDays: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.customer.count({ where }),
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
      const customer = await prisma.customer.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          orders: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              orderNo: true,
              status: true,
              quantity: true,
              createdAt: true,
            },
          },
        },
      });
      if (!customer) throw new Error("Customer not found");
      return customer;
    }),

  create: protectedProcedure
    .input(customerSchema)
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.customer.count();
      const code = `CUST-${String(count + 1).padStart(4, "0")}`;

      return prisma.customer.create({
        data: {
          ...input,
          code,
          creditLimit: input.creditLimit,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: customerSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.customer.update({
        where: { id: input.id },
        data: {
          ...input.data,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.customer.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.customer.update({
        where: { id: input.id },
        data: {
          isActive: input.isActive,
          updatedBy: ctx.session.user.id,
        },
      });
    }),
});
