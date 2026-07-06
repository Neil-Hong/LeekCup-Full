import { notFound } from "next/navigation";
import { TEAMS2 } from "@/data/teams2";

interface AddPlayerPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(TEAMS2).map((id) => ({ id }));
}

export default async function AddPlayerPage({ params }: AddPlayerPageProps) {
  const { id } = await params;
  const team = TEAMS2[Number(id)];

  if (!team) {
    notFound();
  }

  return (
    <main className="add-player-page">
      <section className="add-player-panel" aria-label={`${team.name} add player`}>
        <input
          className="add-player-search"
          placeholder="Search Player"
          type="search"
        />
        <button className="add-player-button" type="button">
          <span>确认</span>
          <span>Confirm</span>
        </button>
      </section>
    </main>
  );
}
