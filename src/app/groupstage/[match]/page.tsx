import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import GroupMatchResultForm from "@/components/groupstage/GroupMatchResultForm";
import { buildSingleRoundRobin } from "@/lib/groupStage";
import { canUseAdminFeatures } from "@/lib/siteAuth";
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
  const headerStore = await headers();
  const canEdit = canUseAdminFeatures(headerStore.get("host"));
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
    <main className="groupstage-page groupstage-enterPage groupmatch-page text-center">
      <div className="groupmatch-titleRow">
        <div className="groupmatch-titleText">
      <h1 className="text-2xl sm:text-3xl text-white font-bold">
        2026-2027赛季 84452韭菜杯小组赛
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        {currentMatch.group} &nbsp;&nbsp; Round {currentMatch.round}
      </h2>
        </div>
        <Link href="/groupstage" className="groupstage-actionButton groupmatch-topBack">
          <span>返回小组对阵</span>
          <span>Back to Group Stage</span>
        </Link>
      </div>

      <GroupMatchResultForm
        awayPlayers={awayPlayers}
        canEdit={canEdit}
        homePlayers={homePlayers}
        match={currentMatch}
        matchPlayerStats={matchPlayerStats}
        result={result}
      />
    </main>
  );
}
