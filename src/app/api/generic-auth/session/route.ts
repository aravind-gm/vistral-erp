import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeGenericSession, TEST_AUTH_COOKIE } from "@/lib/generic-auth";

export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TEST_AUTH_COOKIE)?.value;
  const user = decodeGenericSession(cookie);

  if (!user) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  return NextResponse.json({ session: { user } });
}
