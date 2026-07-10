import { NextRequest, NextResponse } from "next/server";
import {
  createAuctionToken,
  hashAuctionPassword,
  setAuctionCookie,
} from "@/lib/auctionAuth";
import {
  createExclusiveAuctionUserSession,
  readAuctionUserByUsername,
  toAuctionSessionUser,
} from "@/lib/auctionRest";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      username?: string;
      password?: string;
    } | null;
    const username = body?.username?.trim() ?? "";
    const password = body?.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password." },
        { status: 400 },
      );
    }

    const user = await readAuctionUserByUsername(username);

    if (
      !user ||
      hashAuctionPassword(password, user.password_salt) !== user.password_hash
    ) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const sessionUser = toAuctionSessionUser(user);
    const auctionLoginSession = await createExclusiveAuctionUserSession(user.id);
    const response = NextResponse.json({ ok: true, user: sessionUser });
    setAuctionCookie(
      response,
      createAuctionToken({
        user: sessionUser,
        ...auctionLoginSession,
      }),
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
