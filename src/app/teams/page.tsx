import Link from "next/link";
import TeamsDashboard from "@/components/teams/TeamsDashboard";
import { TEAMS2 } from "@/data/teams2";

const teams = Object.entries(TEAMS2).map(([id, team]) => ({
  id: Number(id),
  ...team,
}));

export default function TeamsPage() {
  return (
    <div className="teams-page text-center">
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP
      </h2>
      <div className="teams-page-titleRow">
        <div className="teams-page-subtitle">Team Squad Dashboard</div>
        <Link href="/entrance" className="teams-page-backButton">
          <span>返回</span>
          <span>Back</span>
        </Link>
      </div>
      <TeamsDashboard teams={teams} />
      <div className="h-[100px]" />
    </div>
  );
}
