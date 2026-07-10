import { NextRequest, NextResponse } from "next/server";
import { TEAMS2 } from "@/data/teams2";
import { AUTH_COOKIE_NAME, isAuthorizedSiteAdmin } from "@/lib/siteAuth";
import {
  addPlayerToTeam,
  removeAllPlayersFromTeam,
  removePlayerFromTeam,
  type Fc26PlayerSearchResult,
} from "@/lib/supabaseRest";

interface AddTeamPlayerPayload {
  teamSname?: string;
  player?: Fc26PlayerSearchResult;
  transactionPrice?: number;
}

const validTeamSnames = new Set(
  Object.values(TEAMS2).map((team) => team.sname).filter(Boolean),
);

function ensureAdminRequest(request: NextRequest) {
  if (
    !isAuthorizedSiteAdmin(
      request.headers.get("host"),
      request.cookies.get(AUTH_COOKIE_NAME)?.value,
    )
  ) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authError = ensureAdminRequest(request);
  if (authError) return authError;

  try {
    const payload = (await request.json()) as AddTeamPlayerPayload;
    const teamSname = payload.teamSname ?? "";
    const transactionPrice = Number(payload.transactionPrice ?? 0);

    if (!validTeamSnames.has(teamSname)) {
      return NextResponse.json({ error: "Invalid team." }, { status: 400 });
    }

    if (!payload.player?.player_key) {
      return NextResponse.json({ error: "Invalid player." }, { status: 400 });
    }

    if (!Number.isFinite(transactionPrice) || transactionPrice < 0) {
      return NextResponse.json(
        { error: "Invalid transaction price." },
        { status: 400 },
      );
    }

    const nextBudget = await addPlayerToTeam({
      teamSname,
      player: payload.player,
      transactionPrice,
    });

    return NextResponse.json({ ok: true, budget: nextBudget });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: message === "This player has been chose." ? 409 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = ensureAdminRequest(request);
  if (authError) return authError;

  try {
    const payload = (await request.json()) as {
      teamSname?: string;
      playerKey?: string;
      removeAll?: boolean;
    };
    const teamSname = payload.teamSname ?? "";
    const playerKey = payload.playerKey ?? "";

    if (!validTeamSnames.has(teamSname)) {
      return NextResponse.json({ error: "Invalid team." }, { status: 400 });
    }

    if (payload.removeAll) {
      await removeAllPlayersFromTeam(teamSname);

      return NextResponse.json({ ok: true });
    }

    if (!playerKey) {
      return NextResponse.json({ error: "Invalid player." }, { status: 400 });
    }

    await removePlayerFromTeam({ teamSname, playerKey });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
