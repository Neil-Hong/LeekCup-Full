import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isAuthorizedSiteAdmin } from "@/lib/siteAuth";
import { resetAllTournamentData } from "@/lib/supabaseRest";

export async function POST(request: NextRequest) {
  if (
    !isAuthorizedSiteAdmin(
      request.headers.get("host"),
      request.cookies.get(AUTH_COOKIE_NAME)?.value,
    )
  ) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  try {
    await resetAllTournamentData();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
