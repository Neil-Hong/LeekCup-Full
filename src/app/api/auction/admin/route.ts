import { NextRequest, NextResponse } from "next/server";
import {
  readActiveAuctionUserFromRequest,
  runAuctionAdminAction,
} from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  try {
    const user = await readActiveAuctionUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      action?: "start" | "reveal" | "finish" | "next";
      mode?: "public" | "sealed";
    } | null;

    if (
      body?.action !== "start" &&
      body?.action !== "reveal" &&
      body?.action !== "finish" &&
      body?.action !== "next"
    ) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    await runAuctionAdminAction({
      action: body.action,
      mode: body.mode,
      user,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
