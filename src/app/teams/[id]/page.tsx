import { notFound } from "next/navigation";
import { headers } from "next/headers";
import TeamDetailView from "@/components/teams/TeamDetailView";
import { TEAMS2 } from "@/data/teams2";
import { canUseAdminFeatures } from "@/lib/siteAuth";
import { readTeamBudget, readTeamPlayers } from "@/lib/supabaseRest";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.values(TEAMS2).map((team) => ({ id: team.sname }));
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const headerStore = await headers();
  const canManage = canUseAdminFeatures(headerStore.get("host"));
  const teamEntry = Object.entries(TEAMS2).find(
    ([, team]) => team.sname === decodeURIComponent(id),
  );
  const team = teamEntry?.[1];

  if (!team) {
    notFound();
  }
  const teamSname = team.sname ?? id;
  const [budget, players] = await Promise.all([
    readTeamBudget(teamSname),
    readTeamPlayers(teamSname),
  ]);

  return (
    <div className="teams-page text-center">
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY
      </h2>
      <TeamDetailView
        budget={budget}
        canManage={canManage}
        players={players}
        team={team}
        teamSlug={teamSname}
      />
    </div>
  );
}
