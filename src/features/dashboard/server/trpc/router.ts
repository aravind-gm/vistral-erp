import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/lib/prisma";

export const dashboardRouter = createTRPCRouter({
  stats: protectedProcedure.query(async () => {
    try {
      const [
        totalOrders,
        activeOrders,
        totalCustomers,
        pendingInvoices,
        totalRevenue,
        productionBatches,
      ] = await Promise.all([
        prisma.order.count({ where: { deletedAt: null } }),
        prisma.order.count({
          where: {
            deletedAt: null,
            status: { in: ["CONFIRMED", "IN_PRODUCTION"] },
          },
        }),
        prisma.customer.count({ where: { deletedAt: null, isActive: true } }),
        prisma.invoice.count({
          where: {
            deletedAt: null,
            paymentStatus: { in: ["PENDING", "PARTIAL"] },
          },
        }),
        prisma.invoice.aggregate({
          where: { deletedAt: null, paymentStatus: "PAID" },
          _sum: { totalAmount: true },
        }),
        prisma.productionBatch.count({
          where: {
            deletedAt: null,
            status: "IN_PROGRESS",
          },
        }),
      ]);

      return {
        totalOrders,
        activeOrders,
        totalCustomers,
        pendingInvoices,
        totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
        productionBatches,
      };
    } catch {
      return {
        totalOrders: 0,
        activeOrders: 0,
        totalCustomers: 0,
        pendingInvoices: 0,
        totalRevenue: 0,
        productionBatches: 0,
      };
    }
  }),

  recentOrders: protectedProcedure.query(async () => {
    try {
      return prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNo: true,
          status: true,
          quantity: true,
          deliveryDate: true,
          createdAt: true,
          customer: {
            select: { name: true, code: true },
          },
        },
      });
    } catch {
      return [];
    }
  }),
});
