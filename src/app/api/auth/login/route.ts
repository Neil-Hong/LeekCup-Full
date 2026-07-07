import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthSecret,
  getSitePassword,
  getSiteUsername,
  hasAuthConfig,
  isProdSite,
} from "@/lib/siteAuth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  if (!isProdSite()) {
    return NextResponse.json({ ok: true });
  }

  if (!hasAuthConfig()) {
    return NextResponse.json({ error: "Missing site auth configuration." }, { status: 500 });
  }

  if (body?.username !== getSiteUsername() || body?.password !== getSitePassword()) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE_NAME, getAuthSecret(), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}
