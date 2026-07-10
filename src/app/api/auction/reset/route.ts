import { NextRequest, NextResponse } from "next/server";
import {
  readActiveAuctionUserFromRequest,
  resetAuctionData,
} from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  try {
    const user = await readActiveAuctionUserFromRequest(request);

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
