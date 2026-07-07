import Link from "next/link";
import { buildSingleRoundRobin } from "@/lib/groupStage";
import type { GroupMatchResultRow, GroupTeamRow } from "@/lib/supabaseRest";

interface GroupStageTablesProps {
  groupA: GroupTeamRow[];
  groupB: GroupTeamRow[];
  resultBySlug: Record<string, GroupMatchResultRow>;
}

export default function GroupStageTables({
  groupA,
  groupB,
  resultBySlug,
}: GroupStageTablesProps) {
  return (
    <div className="groupstage-tables">
      <GroupStageTable
        resultBySlug={resultBySlug}
        title="GroupA"
        teams={groupA}
      />
      <GroupStageTable
        resultBySlug={resultBySlug}
        title="GroupB"
        teams={groupB}
      />
    </div>
  );
}

function GroupStageTable({
  title,
  teams,
  resultBySlug,
}: {
  resultBySlug: Record<string, GroupMatchResultRow>;
  title: "GroupA" | "GroupB";
  teams: GroupTeamRow[];
}) {
  const matches = buildSingleRoundRobin(title, teams);

  return (
    <section className="groupstage-table">
      <h3>{title}</h3>
      {matches.length > 0 ? (
        <div className="groupstage-match-list">
          {matches.map((match, index) => (
            <MatchRow
              key={`${title}-${match.round}-${index}`}
              match={match}
              result={resultBySlug[match.slug]}
            />
          ))}
        </div>
      ) : (
        <div className="groupstage-empty">
          <span>请先确认分组</span>
          <span>Please confirm group first.</span>
        </div>
      )}
    </section>
  );
}

function MatchRow({
  match,
  result,
}: {
  match: ReturnType<typeof buildSingleRoundRobin>[number];
  result?: GroupMatchResultRow;
}) {
  return (
    <Link
      className="groupstage-match-row"
      href={`/groupstage/${encodeURIComponent(match.slug)}`}
    >
      <span className="groupstage-round">R{match.round}</span>
      <TeamCell team={match.home} />
      <span className="groupstage-versus">
        {result ? `${result.home_score}:${result.away_score}` : "vs"}
      </span>
      <TeamCell team={match.away} />
    </Link>
  );
}

function TeamCell({ team }: { team: GroupTeamRow }) {
  return (
    <div className="groupstage-team-cell">
      <img src={team.img} alt={team.name} />
      <span>{team.name}</span>
    </div>
  );
}
