import { NextRequest, NextResponse } from "next/server";
import { TEAMS2 } from "@/data/teams2";
import { AUTH_COOKIE_NAME, isAuthorizedSiteAdmin } from "@/lib/siteAuth";
import { updateTeamBudget } from "@/lib/supabaseRest";

interface TeamBudgetPayload {
  budget?: number;
  teamSname?: string;
}

const validTeamSnames = new Set(
  Object.values(TEAMS2).map((team) => team.sname).filter(Boolean),
);

export async function PATCH(request: NextRequest) {
  if (
    !isAuthorizedSiteAdmin(
      request.headers.get("host"),
      request.cookies.get(AUTH_COOKIE_NAME)?.value,
    )
  ) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as TeamBudgetPayload;
    const teamSname = payload.teamSname ?? "";
    const budget = Number(payload.budget);

    if (!validTeamSnames.has(teamSname)) {
      return NextResponse.json({ error: "Invalid team." }, { status: 400 });
    }

    if (!Number.isFinite(budget) || budget < 0) {
      return NextResponse.json({ error: "Invalid budget." }, { status: 400 });
    }

    const nextBudget = await updateTeamBudget({
      teamSname,
      budget: Math.round(budget),
    });

    return NextResponse.json({ ok: true, budget: nextBudget });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
