import Link from "next/link";
import {
  buildGroupPlayoffMatches,
  buildGroupStandings,
  type GroupMatch,
} from "@/lib/groupStage";
import {
  readAllGroupMatchPlayerStats,
  readGroupMatchResults,
  readGroupTable,
  type GroupMatchResultRow,
} from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

const QUESTION_TEAM = {
  img: "/images/Question.png",
  name: "TBD",
  sname: "TBD",
};

export default async function GroupPlayoffsPage() {
  const [groupA, groupB, results, playerStats] = await Promise.all([
    readGroupTable("GroupA"),
    readGroupTable("GroupB"),
    readGroupMatchResults(),
    readAllGroupMatchPlayerStats(),
  ]);
  const groupAStandings = buildGroupStandings(
    "GroupA",
    groupA,
    results,
    playerStats,
  );
  const groupBStandings = buildGroupStandings(
    "GroupB",
    groupB,
    results,
    playerStats,
  );
  const groupStageResultCount = results.filter(
    (result) => result.group_name === "GroupA" || result.group_name === "GroupB",
  ).length;
  const isReady = groupStageResultCount >= 56;
  const matches = isReady
    ? buildGroupPlayoffMatches(groupAStandings, groupBStandings)
    : createPlaceholderMatches();
  const resultBySlug = Object.fromEntries(
    results.map((result) => [result.match_slug, result]),
  ) as Record<string, GroupMatchResultRow>;

  return (
    <main className="groupstage-page groupstage-enterPage groupstandings-page text-center">
      <div className="groupplayoff-titleRow">
        <div className="groupplayoff-titleText">
          <h1 className="text-2xl sm:text-3xl text-white font-bold">
            2026-2027赛季 84452韭菜杯小组附加赛
          </h1>
          <h2 className="text-lg sm:text-xl text-white mt-2">
            2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP GROUP PLAY-OFF STAGE
          </h2>
        </div>
        <Link href="/entrance" className="groupstage-actionButton groupplayoff-topBack">
          <span>返回</span>
          <span>Back</span>
        </Link>
      </div>

      <section className="groupplayoff-table groupplayoff-pageTable">
        <h3>
          <span>小组附加赛 第一阶段</span>
          <span>Group Play-offs Stage-1</span>
        </h3>
        <div className="groupplayoff-list">
          {matches.map((match, index) => (
            <PlayoffMatchRow
              isReady={isReady}
              key={match.slug}
              match={match}
              result={resultBySlug[match.slug]}
              sequenceIndex={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function createPlaceholderMatches(): GroupMatch[] {
  const labels = [
    ["A4", "B7"],
    ["B4", "A7"],
    ["A5", "B6"],
    ["B5", "A6"],
  ];

  return labels.map(([homeLabel, awayLabel], index) => ({
    group: "GroupPlayoffs",
    round: 1,
    index,
    home: {
      ...QUESTION_TEAM,
      sname: homeLabel,
      position_order: index,
      team_id: index,
    },
    away: {
      ...QUESTION_TEAM,
      sname: awayLabel,
      position_order: index + 10,
      team_id: index + 10,
    },
    slug: `GroupPlayoffs-placeholder-${index}`,
  }));
}

function PlayoffMatchRow({
  isReady,
  match,
  result,
  sequenceIndex,
}: {
  isReady: boolean;
  match: GroupMatch;
  result?: GroupMatchResultRow;
  sequenceIndex: number;
}) {
  const content = (
    <>
      <PlayoffTeam
        img={match.home.img}
        label={getSeedLabel(match.index, "home")}
        name={match.home.name}
      />
      <span className="groupplayoff-versus">
        {result ? `${result.home_score}:${result.away_score}` : "VS"}
      </span>
      <PlayoffTeam
        align="right"
        img={match.away.img}
        label={getSeedLabel(match.index, "away")}
        name={match.away.name}
      />
    </>
  );

  if (!isReady) {
    return (
      <div
        className="groupplayoff-row"
        style={{ animationDelay: `${760 + sequenceIndex * 70}ms` }}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      className="groupplayoff-row groupplayoff-linkRow"
      href={`/group-playoffs/${encodeURIComponent(match.slug)}`}
      style={{ animationDelay: `${760 + sequenceIndex * 70}ms` }}
    >
      {content}
    </Link>
  );
}

function getSeedLabel(index: number, side: "home" | "away") {
  const labels = [
    ["A4", "B7"],
    ["B4", "A7"],
    ["A5", "B6"],
    ["B5", "A6"],
  ];

  return labels[index]?.[side === "home" ? 0 : 1] ?? "";
}

function PlayoffTeam({
  align = "left",
  img,
  label,
  name,
}: {
  align?: "left" | "right";
  img: string;
  label: string;
  name: string;
}) {
  return (
    <div className={`groupplayoff-team is-${align}`}>
      <span className="groupplayoff-seed">{label}</span>
      <img src={img} alt={name} />
      <span>{name}</span>
    </div>
  );
}
