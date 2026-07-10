import { NextRequest, NextResponse } from "next/server";
import { TEAMS2 } from "@/data/teams2";
import { AUTH_COOKIE_NAME, isAuthorizedSiteAdmin } from "@/lib/siteAuth";
import {
  saveGroupStageResult,
  type PlayerMatchStatInput,
} from "@/lib/supabaseRest";

interface GroupStageResultPayload {
  awayScore?: number;
  awaySname?: string;
  groupName?: "GroupA" | "GroupB" | "GroupPlayoffs";
  homeScore?: number;
  homeSname?: string;
  matchSlug?: string;
  playerStats?: PlayerMatchStatInput[];
  round?: number;
}

const validTeamSnames = new Set(
  Object.values(TEAMS2).map((team) => team.sname).filter(Boolean),
);

function isValidNumber(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 0;
}

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
    const payload = (await request.json()) as GroupStageResultPayload;
    const homeScore = Number(payload.homeScore ?? 0);
    const awayScore = Number(payload.awayScore ?? 0);
    const round = Number(payload.round ?? 0);

    if (!payload.matchSlug || !payload.homeSname || !payload.awaySname) {
      return NextResponse.json({ error: "Invalid match." }, { status: 400 });
    }

    if (
      !validTeamSnames.has(payload.homeSname) ||
      !validTeamSnames.has(payload.awaySname)
    ) {
      return NextResponse.json({ error: "Invalid team." }, { status: 400 });
    }

    if (
      payload.groupName !== "GroupA" &&
      payload.groupName !== "GroupB" &&
      payload.groupName !== "GroupPlayoffs"
    ) {
      return NextResponse.json({ error: "Invalid group." }, { status: 400 });
    }

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0 ||
      !Number.isInteger(round) ||
      round <= 0
    ) {
      return NextResponse.json({ error: "Invalid score." }, { status: 400 });
    }

    const playerStats = payload.playerStats ?? [];

    if (
      playerStats.some(
        (stat) =>
          !stat.player_key ||
          !stat.team_sname ||
          (stat.team_sname !== payload.homeSname &&
            stat.team_sname !== payload.awaySname) ||
          !isValidNumber(stat.yellow_card) ||
          !isValidNumber(stat.red_card) ||
          !isValidNumber(stat.goals) ||
          !isValidNumber(stat.assists),
      )
    ) {
      return NextResponse.json({ error: "Invalid player stats." }, { status: 400 });
    }

    await saveGroupStageResult({
      awayScore,
      awaySname: payload.awaySname,
      groupName: payload.groupName,
      homeScore,
      homeSname: payload.homeSname,
      matchSlug: payload.matchSlug,
      playerStats,
      round,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
