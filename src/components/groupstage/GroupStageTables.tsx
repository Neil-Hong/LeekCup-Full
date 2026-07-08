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
  const groupAMatches = buildSingleRoundRobin("GroupA", groupA);
  const groupBMatches = buildSingleRoundRobin("GroupB", groupB);

  return (
    <div className="groupstage-tables">
      <GroupStageTable
        matches={groupAMatches}
        resultBySlug={resultBySlug}
        title="GroupA"
        startIndex={0}
      />
      <GroupStageTable
        matches={groupBMatches}
        resultBySlug={resultBySlug}
        title="GroupB"
        startIndex={groupAMatches.length}
      />
    </div>
  );
}

function GroupStageTable({
  matches,
  title,
  resultBySlug,
  startIndex,
}: {
  matches: ReturnType<typeof buildSingleRoundRobin>;
  resultBySlug: Record<string, GroupMatchResultRow>;
  title: "GroupA" | "GroupB";
  startIndex: number;
}) {
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
              sequenceIndex={startIndex + index}
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
  sequenceIndex,
}: {
  match: ReturnType<typeof buildSingleRoundRobin>[number];
  result?: GroupMatchResultRow;
  sequenceIndex: number;
}) {
  return (
    <Link
      className="groupstage-match-row"
      href={`/groupstage/${encodeURIComponent(match.slug)}`}
      style={{ animationDelay: `${760 + sequenceIndex * 70}ms` }}
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
