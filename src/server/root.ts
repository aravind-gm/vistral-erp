import { createTRPCRouter } from "@/server/trpc";
import { dashboardRouter } from "@/features/dashboard/server/trpc/router";
import { customersRouter } from "@/features/customers/server/trpc/router";
import { suppliersRouter } from "@/features/suppliers/server/trpc/router";
import { ordersRouter } from "@/features/orders/server/trpc/router";
import { yarnRouter } from "@/features/yarn/server/trpc/router";
import { productionRouter } from "@/features/production/server/trpc/router";
import { financeRouter } from "@/features/finance/server/trpc/router";
import { usersRouter } from "@/features/users/server/trpc/router";
import { settingsRouter } from "@/features/settings/server/trpc/router";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  customers: customersRouter,
  suppliers: suppliersRouter,
  orders: ordersRouter,
  yarn: yarnRouter,
  production: productionRouter,
  finance: financeRouter,
  users: usersRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
