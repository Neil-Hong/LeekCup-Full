import { NextRequest, NextResponse } from "next/server";
import {
  placeAuctionBid,
  readActiveAuctionUserFromRequest,
} from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  try {
    const user = await readActiveAuctionUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      amount?: number;
    } | null;
    const amount = Number(body?.amount ?? 0);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid bid amount." }, { status: 400 });
    }

    await placeAuctionBid({ amount, user });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
