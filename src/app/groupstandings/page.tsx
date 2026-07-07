import Link from "next/link";
import { buildGroupStandings, type GroupStandingRow } from "@/lib/groupStage";
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

  return (
    <main className="groupstage-page groupstandings-page text-center">
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
        <StandingsTable rows={groupAStandings} title="Group A Standings" />
        <StandingsTable rows={groupBStandings} title="Group B Standings" />
      </div>
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
  title,
}: {
  rows: GroupStandingRow[];
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
