import { NextRequest, NextResponse } from "next/server";
import {
  readActiveAuctionUserFromRequest,
  resetAuctionData,
} from "@/lib/auctionRest";
import { AUTH_COOKIE_NAME, isAuthorizedSiteAdmin } from "@/lib/siteAuth";

export async function POST(request: NextRequest) {
  try {
    const auctionUser = await readActiveAuctionUserFromRequest(request);
    const siteAdminUser = isAuthorizedSiteAdmin(
      request.headers.get("host"),
      request.cookies.get(AUTH_COOKIE_NAME)?.value,
    )
      ? {
          id: "site-admin",
          username: "site-admin",
          displayName: "Site Admin",
          teamSname: null,
          role: "admin" as const,
        }
      : null;
    const user = auctionUser ?? siteAdminUser;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await resetAuctionData(user);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
