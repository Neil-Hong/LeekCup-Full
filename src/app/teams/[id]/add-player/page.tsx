import { notFound } from "next/navigation";
import AddPlayerSearch from "@/components/teams/AddPlayerSearch";
import { TEAMS2 } from "@/data/teams2";

interface AddPlayerPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.values(TEAMS2).map((team) => ({ id: team.sname }));
}

export default async function AddPlayerPage({ params }: AddPlayerPageProps) {
  const { id } = await params;
  const team = Object.values(TEAMS2).find(
    (entry) => entry.sname === decodeURIComponent(id),
  );

  if (!team) {
    notFound();
  }

  return (
    <main className="add-player-page">
      <AddPlayerSearch teamName={team.name} teamSname={team.sname ?? id} />
    </main>
  );
}
