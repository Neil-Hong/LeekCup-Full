import { NextRequest, NextResponse } from "next/server";
import { upsertAuctionUsers, type AuctionSetupUserInput } from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.AUCTION_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { error: "Missing AUCTION_SETUP_SECRET." },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      setupSecret?: string;
      users?: AuctionSetupUserInput[];
    } | null;

    if (body?.setupSecret !== setupSecret) {
      return NextResponse.json({ error: "Invalid setup secret." }, { status: 401 });
    }

    if (!Array.isArray(body.users) || body.users.length === 0) {
      return NextResponse.json({ error: "Missing users." }, { status: 400 });
    }

    for (const user of body.users) {
      if (!user.username || !user.password || !user.displayName || !user.role) {
        return NextResponse.json(
          { error: "Each user needs username, password, displayName, and role." },
          { status: 400 },
        );
      }
    }

    await upsertAuctionUsers(body.users);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
