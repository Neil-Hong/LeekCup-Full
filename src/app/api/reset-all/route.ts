import { NextResponse } from "next/server";
import { resetAllTournamentData } from "@/lib/supabaseRest";

export async function POST() {
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
