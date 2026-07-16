import { NextRequest, NextResponse } from "next/server";
import { canAccessAuctionDisplay } from "@/lib/auctionRoles";
import {
  readActiveAuctionUserFromRequest,
  readAuctionDisplayState,
} from "@/lib/auctionRest";

export async function GET(request: NextRequest) {
  try {
    const user = await readActiveAuctionUserFromRequest(request);

    if (!canAccessAuctionDisplay(user)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json(await readAuctionDisplayState());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
