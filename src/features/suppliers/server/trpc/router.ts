import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  altPhone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  country: z.string().default("India"),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  supplierType: z.string().min(1, "Supplier type is required"),
  notes: z.string().optional(),
});

const listInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  supplierType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const suppliersRouter = createTRPCRouter({
  list: protectedProcedure.input(listInput).query(async ({ input }) => {
    const { page, limit, search, supplierType, isActive } = input;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(supplierType && { supplierType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          name: true,
          contactPerson: true,
          phone: true,
          email: true,
          city: true,
          state: true,
          supplierType: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.supplier.count({ where }),
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
      const supplier = await prisma.supplier.findFirst({
        where: { id: input.id, deletedAt: null },
      });
      if (!supplier) throw new Error("Supplier not found");
      return supplier;
    }),

  create: protectedProcedure
    .input(supplierSchema)
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.supplier.count();
      const code = `SUPP-${String(count + 1).padStart(4, "0")}`;

      return prisma.supplier.create({
        data: {
          ...input,
          code,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: supplierSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.supplier.update({
        where: { id: input.id },
        data: { ...input.data, updatedBy: ctx.session.user.id },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.supplier.update({
        where: { id: input.id },
        data: { deletedAt: new Date(), updatedBy: ctx.session.user.id },
      });
    }),
});
