import Link from "next/link";
import {
  buildGroupPlayoffMatches,
  buildGroupStandings,
  type GroupStandingRow,
} from "@/lib/groupStage";
import { readGroupMatchResults, readGroupTable } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

export default async function GroupStandingsPage() {
  const [groupA, groupB, results] = await Promise.all([
    readGroupTable("GroupA"),
    readGroupTable("GroupB"),
    readGroupMatchResults(),
  ]);
  const groupAStandings = buildGroupStandings("GroupA", groupA, results);
  const groupBStandings = buildGroupStandings("GroupB", groupB, results);
  const groupStageResultCount = results.filter(
    (result) => result.group_name === "GroupA" || result.group_name === "GroupB",
  ).length;
  const isGroupStageComplete = groupStageResultCount >= 56;
  const playoffMatches = isGroupStageComplete
    ? buildGroupPlayoffMatches(groupAStandings, groupBStandings)
    : [];

  return (
    <main className="groupstage-page groupstage-enterPage groupstandings-page text-center">
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯小组实时排名
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP GROUP STANDINGS
      </h2>

      <div className="groupstage-actions">
        <Link href="/groupstage" className="groupstage-actionButton">
          <span>返回小组赛</span>
          <span>Back to Group</span>
        </Link>
        <Link href="/stats" className="groupstage-actionButton">
          <span>实时数据</span>
          <span>Live Data</span>
        </Link>
      </div>

      <div className="groupstandings-tables">
        <StandingsTable
          rows={groupAStandings}
          startIndex={0}
          title="Group A Standings"
        />
        <StandingsTable
          rows={groupBStandings}
          startIndex={groupAStandings.length}
          title="Group B Standings"
        />
      </div>

      <PlayOffTable
        groupAStandings={groupAStandings}
        groupBStandings={groupBStandings}
        href={playoffMatches.length > 0 ? "/group-playoffs" : "#"}
        isReady={isGroupStageComplete}
        startIndex={groupAStandings.length + groupBStandings.length}
      />
    </main>
  );
}

function getStandingClass(index: number, total: number) {
  if (index < 3) {
    return " is-qualified";
  }

  if (index === total - 1) {
    return " is-eliminated";
  }

  return "";
}

function StandingsTable({
  rows,
  startIndex,
  title,
}: {
  rows: GroupStandingRow[];
  startIndex: number;
  title: string;
}) {
  return (
    <section className="groupstandings-table">
      <h3>{title}</h3>
      {rows.length > 0 ? (
        <div className="groupstandings-grid">
          <div className="groupstandings-head">
            <span>NO</span>
            <span>Team</span>
            <span>Pts</span>
          </div>
          {rows.map((row, index) => (
            <div
              className={`groupstandings-row${getStandingClass(index, rows.length)}`}
              key={row.team.sname}
              style={{ animationDelay: `${760 + (startIndex + index) * 70}ms` }}
            >
              <span className="groupstandings-no">{index + 1}</span>
              <div className="groupstandings-team">
                <img src={row.team.img} alt={row.team.name} />
                <span>{row.team.name}</span>
              </div>
              <span className="groupstandings-points">{row.points}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="groupstage-empty">No confirmed group yet.</div>
      )}
    </section>
  );
}

function getPlayoffTeam(
  rows: GroupStandingRow[],
  position: number,
  isReady: boolean,
) {
  if (!isReady) {
    return null;
  }

  return rows[position - 1] ?? null;
}

function PlayOffTable({
  groupAStandings,
  groupBStandings,
  href,
  isReady,
  startIndex,
}: {
  groupAStandings: GroupStandingRow[];
  groupBStandings: GroupStandingRow[];
  href: string;
  isReady: boolean;
  startIndex: number;
}) {
  const pairings = [
    {
      leftLabel: "A4",
      leftTeam: getPlayoffTeam(groupAStandings, 4, isReady),
      rightLabel: "B7",
      rightTeam: getPlayoffTeam(groupBStandings, 7, isReady),
    },
    {
      leftLabel: "B4",
      leftTeam: getPlayoffTeam(groupBStandings, 4, isReady),
      rightLabel: "A7",
      rightTeam: getPlayoffTeam(groupAStandings, 7, isReady),
    },
    {
      leftLabel: "A5",
      leftTeam: getPlayoffTeam(groupAStandings, 5, isReady),
      rightLabel: "B6",
      rightTeam: getPlayoffTeam(groupBStandings, 6, isReady),
    },
    {
      leftLabel: "B5",
      leftTeam: getPlayoffTeam(groupBStandings, 5, isReady),
      rightLabel: "A6",
      rightTeam: getPlayoffTeam(groupAStandings, 6, isReady),
    },
  ];

  return (
    <section className="groupplayoff-table">
      <h3>
        <span>小组附加赛</span>
        <span>Group Play-offs</span>
      </h3>
      <div className="groupplayoff-list">
        {pairings.map((pairing, index) => (
          <div
            className="groupplayoff-row"
            key={`${pairing.leftLabel}-${pairing.rightLabel}`}
            style={{ animationDelay: `${760 + (startIndex + index) * 70}ms` }}
          >
            <PlayOffTeamCell label={pairing.leftLabel} row={pairing.leftTeam} />
            <span className="groupplayoff-versus">VS</span>
            <PlayOffTeamCell
              align="right"
              label={pairing.rightLabel}
              row={pairing.rightTeam}
            />
          </div>
        ))}
      </div>
      <Link
        aria-disabled={!isReady}
        className={`groupplayoff-enterButton${isReady ? "" : " is-disabled"}`}
        href={href}
      >
        <span>进入小组附加赛</span>
        <span>Group Play-offs</span>
      </Link>
    </section>
  );
}

function PlayOffTeamCell({
  align = "left",
  label,
  row,
}: {
  align?: "left" | "right";
  label: string;
  row: GroupStandingRow | null;
}) {
  const team = row?.team;

  return (
    <div className={`groupplayoff-team is-${align}`}>
      <span className="groupplayoff-seed">{label}</span>
      <img src={team?.img ?? "/images/Question.png"} alt={team?.name ?? "TBD"} />
      <span>{team?.name ?? "TBD"}</span>
    </div>
  );
}
