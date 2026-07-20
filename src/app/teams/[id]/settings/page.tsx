import { notFound } from "next/navigation";
import TeamSettingsClient from "@/components/teams/TeamSettingsClient";
import { TEAMS2 } from "@/data/teams2";

interface TeamSettingsPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage({
  params,
}: TeamSettingsPageProps) {
  const { id } = await params;
  const team = Object.values(TEAMS2).find(
    (entry) => entry.sname === decodeURIComponent(id),
  );

  if (!team?.sname) {
    notFound();
  }

  return (
    <div className="teams-page team-settings-page">
      <h1 className="team-settings-pageTitle">
        <span>{"\u7403\u961f\u8bbe\u7f6e"}</span>
        <span>Team Settings</span>
      </h1>
      <TeamSettingsClient team={team} teamSlug={team.sname} />
    </div>
  );
}
