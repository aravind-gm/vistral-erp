import { NextResponse } from "next/server";
import { encodeGenericSession, TEST_AUTH_COOKIE } from "@/lib/generic-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  const expectedEmail = (process.env.GENERIC_AUTH_EMAIL ?? "admin@vistral.in").toLowerCase();
  const expectedPassword = process.env.GENERIC_AUTH_PASSWORD ?? "Admin@123";

  if (!email || !password || email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const sessionUser = {
    id: "test-admin",
    name: "Administrator",
    email,
    role: "OWNER",
  };

  const response = NextResponse.json({ session: { user: sessionUser } });
  response.cookies.set(TEST_AUTH_COOKIE, encodeGenericSession(sessionUser), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
