import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import GroupMatchResultForm from "@/components/groupstage/GroupMatchResultForm";
import { buildGroupPlayoffMatches, buildGroupStandings } from "@/lib/groupStage";
import { canUseAdminFeatures } from "@/lib/siteAuth";
import {
  readGroupMatchPlayerStats,
  readGroupMatchResult,
  readGroupMatchResults,
  readGroupTable,
  readSelectedPlayersForTeam,
} from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

interface GroupPlayoffMatchPageProps {
  params: Promise<{ match: string }>;
}

export default async function GroupPlayoffMatchPage({
  params,
}: GroupPlayoffMatchPageProps) {
  const { match } = await params;
  const headerStore = await headers();
  const canEdit = canUseAdminFeatures(headerStore.get("host"));
  const decodedMatch = decodeURIComponent(match);
  const [groupA, groupB, results] = await Promise.all([
    readGroupTable("GroupA"),
    readGroupTable("GroupB"),
    readGroupMatchResults(),
  ]);
  const groupAStandings = buildGroupStandings("GroupA", groupA, results);
  const groupBStandings = buildGroupStandings("GroupB", groupB, results);
  const matches = buildGroupPlayoffMatches(groupAStandings, groupBStandings);
  const currentMatch = matches.find((entry) => entry.slug === decodedMatch);

  if (!currentMatch || results.length < 56) {
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
        小组附加赛
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        Group Play-offs &nbsp;&nbsp; Match {currentMatch.index + 1}
      </h2>
        </div>
        <Link href="/group-playoffs" className="groupstage-actionButton groupmatch-topBack">
          <span>返回小组附加赛</span>
          <span>Back to Play-offs</span>
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
