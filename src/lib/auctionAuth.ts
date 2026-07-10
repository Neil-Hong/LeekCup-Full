import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const AUCTION_COOKIE_NAME = "leekcup_auction_auth";

export interface AuctionSessionUser {
  id: string;
  username: string;
  displayName: string;
  teamSname: string | null;
  role: "admin" | "bidder";
}

export interface AuctionTokenPayload extends AuctionSessionUser {
  auctionSessionId: string;
  auctionSessionSecret: string;
}

function getAuctionSecret() {
  return (
    process.env.AUCTION_AUTH_SECRET ??
    process.env.SITE_AUTH_SECRET ??
    process.env.SITE_AUTH_TOKEN ??
    ""
  );
}

export function hashAuctionPassword(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function hashAuctionSessionSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function signPayload(payload: string) {
  const secret = getAuctionSecret();

  if (!secret) {
    throw new Error("Missing AUCTION_AUTH_SECRET or SITE_AUTH_SECRET.");
  }

  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAuctionToken({
  auctionSessionId,
  auctionSessionSecret,
  user,
}: {
  auctionSessionId: string;
  auctionSessionSecret: string;
  user: AuctionSessionUser;
}) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      auctionSessionId,
      auctionSessionSecret,
      nonce: randomBytes(12).toString("hex"),
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function readAuctionToken(token?: string | null): AuctionTokenPayload | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  let parsed: AuctionTokenPayload & { exp?: number };

  try {
    parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AuctionTokenPayload & { exp?: number };
  } catch {
    return null;
  }

  if (!parsed.exp || parsed.exp < Date.now()) {
    return null;
  }

  if (!parsed.auctionSessionId || !parsed.auctionSessionSecret) {
    return null;
  }

  return {
    id: parsed.id,
    username: parsed.username,
    displayName: parsed.displayName,
    teamSname: parsed.teamSname,
    role: parsed.role,
    auctionSessionId: parsed.auctionSessionId,
    auctionSessionSecret: parsed.auctionSessionSecret,
  };
}

export function getAuctionUserFromRequest(request: NextRequest) {
  return readAuctionToken(request.cookies.get(AUCTION_COOKIE_NAME)?.value);
}

export function setAuctionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUCTION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.VERCEL_ENV === "production",
  });
}

export function clearAuctionCookie(response: NextResponse) {
  response.cookies.set(AUCTION_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.VERCEL_ENV === "production",
  });
}
