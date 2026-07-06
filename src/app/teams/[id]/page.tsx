import { notFound } from "next/navigation";
import TeamDetailView from "@/components/teams/TeamDetailView";
import { TEAMS2 } from "@/data/teams2";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(TEAMS2).map((id) => ({ id }));
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const team = TEAMS2[Number(id)];

  if (!team) {
    notFound();
  }

  return (
    <div className="teams-page text-center">
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY
      </h2>
      <TeamDetailView team={team} teamId={Number(id)} />
    </div>
  );
}
