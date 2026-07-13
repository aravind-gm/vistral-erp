import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1),
  legalName: z.string().min(1),
  gstin: z.string().min(15).max(15),
  pan: z.string().min(10).max(10),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  country: z.string().default("India"),
  phone: z.string().min(10),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  upiId: z.string().optional(),
});

export const settingsRouter = createTRPCRouter({
  getCompany: protectedProcedure.query(async () => {
    return prisma.company.findFirst();
  }),

  upsertCompany: protectedProcedure
    .input(companySchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.company.findFirst();
      if (existing) {
        return prisma.company.update({
          where: { id: existing.id },
          data: { ...input, updatedBy: ctx.session.user.id },
        });
      }
      return prisma.company.create({
        data: { ...input, createdBy: ctx.session.user.id, updatedBy: ctx.session.user.id },
      });
    }),
});
