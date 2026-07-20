import { NextRequest, NextResponse } from "next/server";
import { isAuctionAdmin } from "@/lib/auctionRoles";
import { readActiveAuctionUserFromRequest } from "@/lib/auctionRest";
import {
  readTeamPlayers,
  readTeamTactics,
  saveTeamTactics,
  type TeamSetPieceAssignment,
  type TeamLineupSlot,
  type TeamTacticSettings,
} from "@/lib/supabaseRest";
import { isFormationKey, TEAM_FORMATIONS } from "@/lib/teamFormations";

const ROLE_VALUES = new Set<TeamLineupSlot["role"]>([
  "defend",
  "balanced",
  "attack",
]);
const DEFENSIVE_STYLE_VALUES = new Set<TeamTacticSettings["defensiveStyle"]>([
  "balanced",
  "press",
  "low-block",
]);
const BUILD_UP_STYLE_VALUES = new Set<TeamTacticSettings["buildUpStyle"]>([
  "balanced",
  "counter",
  "short-passing",
]);
const ASSIGNMENT_KEYS = new Set([
  "captain",
  "free-kick-left",
  "free-kick-right",
  "free-kick-long",
  "penalty",
  "corner-left",
  "corner-right",
  "corner-attack-target",
  "corner-attack-near-post",
  "corner-attack-edge",
  "corner-attack-cover",
  "corner-attack-decoy",
  "corner-attack-post-guard",
  "corner-defend-near-post",
  "corner-defend-far-post",
  "throw-in-left",
  "throw-in-right",
]);

async function authorizeTeamSettings(request: NextRequest, teamSname: string) {
  const user = await readActiveAuctionUserFromRequest(request);

  if (!user) {
    return { error: "Please log in to manage team settings.", status: 401 } as const;
  }

  if (!isAuctionAdmin(user.role) && user.teamSname !== teamSname) {
    return { error: "This account is not assigned to this team.", status: 403 } as const;
  }

  return { user } as const;
}

export async function GET(request: NextRequest) {
  const teamSname = request.nextUrl.searchParams.get("teamSname")?.trim() ?? "";

  if (!teamSname) {
    return NextResponse.json({ error: "Missing team." }, { status: 400 });
  }

  try {
    const authorization = await authorizeTeamSettings(request, teamSname);

    if ("error" in authorization) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const [players, tactics] = await Promise.all([
      readTeamPlayers(teamSname),
      readTeamTactics(teamSname),
    ]);

    return NextResponse.json({
      ok: true,
      user: authorization.user,
      players,
      tactics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load team settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    teamSname?: string;
    formation?: string;
    tactics?: TeamTacticSettings;
    lineup?: TeamLineupSlot[];
    assignments?: TeamSetPieceAssignment[];
  } | null;
  const teamSname = body?.teamSname?.trim() ?? "";

  if (!teamSname || !body?.formation || !body.tactics || !body.lineup) {
    return NextResponse.json({ error: "Missing team settings." }, { status: 400 });
  }

  if (!isFormationKey(body.formation)) {
    return NextResponse.json({ error: "Unknown formation." }, { status: 400 });
  }

  const { tactics, lineup } = body;
  const assignments = body.assignments ?? [];

  if (
    !DEFENSIVE_STYLE_VALUES.has(tactics.defensiveStyle) ||
    !BUILD_UP_STYLE_VALUES.has(tactics.buildUpStyle) ||
    !Number.isInteger(tactics.width) ||
    !Number.isInteger(tactics.lineHeight) ||
    tactics.width < 1 ||
    tactics.width > 100 ||
    tactics.lineHeight < 1 ||
    tactics.lineHeight > 100
  ) {
    return NextResponse.json({ error: "Invalid tactics." }, { status: 400 });
  }

  const playerKeys = lineup.map((slot) => slot.playerKey);
  const formationSlots = new Set(
    TEAM_FORMATIONS[body.formation].slots.map((slot) => slot.id),
  );

  if (
    lineup.length > 11 ||
    new Set(playerKeys).size !== playerKeys.length ||
    new Set(lineup.map((slot) => slot.slotId)).size !== lineup.length ||
    lineup.some(
      (slot) =>
        !slot.slotId ||
        !slot.playerKey ||
        !ROLE_VALUES.has(slot.role) ||
        (slot.playerRole !== undefined && (typeof slot.playerRole !== "string" || slot.playerRole.length > 60)) ||
        (slot.focus !== undefined && (typeof slot.focus !== "string" || slot.focus.length > 60)) ||
        !formationSlots.has(slot.slotId),
    )
  ) {
    return NextResponse.json({ error: "Invalid lineup." }, { status: 400 });
  }

  if (
    assignments.length > ASSIGNMENT_KEYS.size ||
    new Set(assignments.map((assignment) => assignment.assignmentKey)).size !== assignments.length ||
    assignments.some(
      (assignment) =>
        !ASSIGNMENT_KEYS.has(assignment.assignmentKey) ||
        !assignment.playerKey,
    )
  ) {
    return NextResponse.json({ error: "Invalid player assignments." }, { status: 400 });
  }

  try {
    const authorization = await authorizeTeamSettings(request, teamSname);

    if ("error" in authorization) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const roster = await readTeamPlayers(teamSname);
    const rosterPlayerKeys = new Set(roster.map((player) => player.player_key));

    if (
      playerKeys.some((playerKey) => !rosterPlayerKeys.has(playerKey)) ||
      assignments.some((assignment) => !rosterPlayerKeys.has(assignment.playerKey))
    ) {
      return NextResponse.json(
        { error: "Settings contain a player who is not in this team." },
        { status: 400 },
      );
    }

    await saveTeamTactics({
      teamSname,
      userId: authorization.user.id,
      formation: body.formation,
      tactics,
      lineup,
      assignments,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save team settings." },
      { status: 500 },
    );
  }
}
