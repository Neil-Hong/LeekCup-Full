import Link from "next/link";
import GroupStageTables from "@/components/groupstage/GroupStageTables";
import {
  readGroupMatchResults,
  readGroupTable,
  type GroupMatchResultRow,
} from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

export default async function GroupStagePage() {
  const [groupA, groupB, results] = await Promise.all([
    readGroupTable("GroupA"),
    readGroupTable("GroupB"),
    readGroupMatchResults(),
  ]);
  const resultBySlug = Object.fromEntries(
    results.map((result) => [result.match_slug, result]),
  ) as Record<string, GroupMatchResultRow>;

  return (
    <>
      <main
        className="groupstage-page groupstage-enterPage text-center"
        id="groupstage-top"
      >
        <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
          2026-2027赛季 84452韭菜杯小组赛
        </h1>
        <h2 className="text-lg sm:text-xl text-white mt-2">
          2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP GROUP STAGE
        </h2>

        <div className="groupstage-actions">
          <Link href="/entrance" className="groupstage-actionButton">
            <span>返回</span>
            <span>Back</span>
          </Link>
          <Link href="/groupstandings" className="groupstage-actionButton">
            <span>小组实时排名</span>
            <span>Group Standings</span>
          </Link>
          <Link href="/stats" className="groupstage-actionButton">
            <span>实时数据</span>
            <span>Live Data</span>
          </Link>
        </div>

        <GroupStageTables
          groupA={groupA}
          groupB={groupB}
          resultBySlug={resultBySlug}
        />
      </main>
      <a
        aria-label="Back to top"
        className="groupstage-topButton"
        href="#groupstage-top"
      >
        ↑
      </a>
    </>
  );
}
