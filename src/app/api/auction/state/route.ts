import { NextRequest, NextResponse } from "next/server";
import {
  readActiveAuctionUserFromRequest,
  readAuctionState,
} from "@/lib/auctionRest";

export async function GET(request: NextRequest) {
  try {
    const user = await readActiveAuctionUserFromRequest(request);
    const state = await readAuctionState(user);

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
