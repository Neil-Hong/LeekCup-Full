import { NextRequest, NextResponse } from "next/server";
import { clearAuctionCookie } from "@/lib/auctionAuth";
import { revokeAuctionUserSessionFromRequest } from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  await revokeAuctionUserSessionFromRequest(request);

  const response = NextResponse.json({ ok: true });
  clearAuctionCookie(response);

  return response;
}
