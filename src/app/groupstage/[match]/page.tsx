import Link from "next/link";
import { notFound } from "next/navigation";
import GroupMatchResultForm from "@/components/groupstage/GroupMatchResultForm";
import { buildSingleRoundRobin } from "@/lib/groupStage";
import {
  readGroupMatchPlayerStats,
  readGroupMatchResult,
  readGroupTable,
  readSelectedPlayersForTeam,
} from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

interface GroupStageMatchPageProps {
  params: Promise<{ match: string }>;
}

export default async function GroupStageMatchPage({
  params,
}: GroupStageMatchPageProps) {
  const { match } = await params;
  const decodedMatch = decodeURIComponent(match);
  const [groupA, groupB] = await Promise.all([
    readGroupTable("GroupA"),
    readGroupTable("GroupB"),
  ]);
  const matches = [
    ...buildSingleRoundRobin("GroupA", groupA),
    ...buildSingleRoundRobin("GroupB", groupB),
  ];
  const currentMatch = matches.find((entry) => entry.slug === decodedMatch);

  if (!currentMatch) {
    notFound();
  }

  const [homePlayers, awayPlayers, result, matchPlayerStats] = await Promise.all([
    readSelectedPlayersForTeam(currentMatch.home.sname),
    readSelectedPlayersForTeam(currentMatch.away.sname),
    readGroupMatchResult(currentMatch.slug),
    readGroupMatchPlayerStats(currentMatch.slug),
  ]);

  return (
    <main className="groupstage-page groupmatch-page text-center">
      <Link href="/groupstage" className="team-detail-navButton groupstage-back">
        Back to Group
      </Link>

      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯小组赛
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        {currentMatch.group} &nbsp;&nbsp; Round {currentMatch.round}
      </h2>

      <GroupMatchResultForm
        awayPlayers={awayPlayers}
        homePlayers={homePlayers}
        match={currentMatch}
        matchPlayerStats={matchPlayerStats}
        result={result}
      />
    </main>
  );
}
