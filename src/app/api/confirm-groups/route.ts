import { NextResponse } from "next/server";
import {
  readGroupTable,
  replaceGroupTable,
  type GroupTeamRow,
} from "@/lib/supabaseRest";

interface ConfirmGroupsPayload {
  groupA?: GroupTeamRow[];
  groupB?: GroupTeamRow[];
}

function isValidGroup(group: unknown): group is GroupTeamRow[] {
  return (
    Array.isArray(group) &&
    group.length === 8 &&
    group.every(
      (team) =>
        typeof team === "object" &&
        team !== null &&
        typeof (team as GroupTeamRow).position_order === "number" &&
        typeof (team as GroupTeamRow).team_id === "number" &&
        typeof (team as GroupTeamRow).name === "string" &&
        typeof (team as GroupTeamRow).sname === "string" &&
        typeof (team as GroupTeamRow).img === "string",
    )
  );
}

export async function GET() {
  try {
    const [groupA, groupB] = await Promise.all([
      readGroupTable("GroupA"),
      readGroupTable("GroupB"),
    ]);

    return NextResponse.json({
      groupAHasData: groupA.length > 0,
      groupBHasData: groupB.length > 0,
      hasConfirmedGroups: groupA.length > 0 && groupB.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ConfirmGroupsPayload;

    if (!isValidGroup(payload.groupA) || !isValidGroup(payload.groupB)) {
      return NextResponse.json(
        { error: "GroupA and GroupB must each contain 8 teams." },
        { status: 400 },
      );
    }

    await replaceGroupTable("GroupA", payload.groupA);
    await replaceGroupTable("GroupB", payload.groupB);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
