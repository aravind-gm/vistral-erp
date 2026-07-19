import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decodeGenericSession, TEST_AUTH_COOKIE } from "@/lib/generic-auth";

export interface Context {
  req: NextRequest;
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  } | null;
}

export async function createTRPCContext(req: NextRequest): Promise<Context> {
  const genericCookie = req.cookies.get(TEST_AUTH_COOKIE)?.value;
  const genericUser = decodeGenericSession(genericCookie);

  if (genericUser) {
    return {
      req,
      session: {
        user: {
          id: genericUser.id,
          name: genericUser.name,
          email: genericUser.email,
          role: genericUser.role,
        },
      },
    };
  }

  const session = await auth.api.getSession({ headers: req.headers });
  return {
    req,
    session: session
      ? {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: (session.user as { role?: string }).role ?? "MERCHANDISER",
          },
        }
      : null,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
