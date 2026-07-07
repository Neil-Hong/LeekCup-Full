import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/siteAuth";

function clearAuthCookie(request: NextRequest, response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}

export async function GET(request: NextRequest) {
  return clearAuthCookie(request, NextResponse.redirect(new URL("/", request.url)));
}

export async function POST(request: NextRequest) {
  return clearAuthCookie(request, NextResponse.json({ ok: true }));
}
