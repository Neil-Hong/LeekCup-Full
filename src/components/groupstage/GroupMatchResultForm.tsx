"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { GroupMatch } from "@/lib/groupStage";
import type {
  GroupMatchPlayerStatRow,
  GroupMatchResultRow,
  MatchPlayerRow,
  PlayerMatchStatInput,
} from "@/lib/supabaseRest";

interface GroupMatchResultFormProps {
  awayPlayers: MatchPlayerRow[];
  homePlayers: MatchPlayerRow[];
  match: GroupMatch;
  matchPlayerStats: GroupMatchPlayerStatRow[];
  result: GroupMatchResultRow | null;
}

export default function GroupMatchResultForm({
  awayPlayers,
  homePlayers,
  match,
  matchPlayerStats,
  result,
}: GroupMatchResultFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const matchStatsByPlayerKey = new Map(
    matchPlayerStats.map((stat) => [stat.player_key, stat]),
  );

  const submitResult = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const formData = new FormData(event.currentTarget);
    const readNumber = (name: string) => Number(formData.get(name) ?? 0);
    const playerStats: PlayerMatchStatInput[] = [...homePlayers, ...awayPlayers].map(
      (player) => ({
        player_key: player.player_key,
        team_sname: player.team_sname,
        yellow_card: readNumber(`${player.player_key}:yellow_card`),
        red_card: readNumber(`${player.player_key}:red_card`),
        goals: readNumber(`${player.player_key}:goals`),
        assists: readNumber(`${player.player_key}:assists`),
      }),
    );

    setIsSaving(true);
    setErrorMessage("");

    const response = await fetch("/api/groupstage-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        awayScore: readNumber("awayScore"),
        awaySname: match.away.sname,
        groupName: match.group,
        homeScore: readNumber("homeScore"),
        homeSname: match.home.sname,
        matchSlug: match.slug,
        playerStats,
        round: match.round,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setErrorMessage(data?.error ?? "Failed to confirm result.");
      setIsSaving(false);
      return;
    }

    router.refresh();
    setIsSaving(false);
  };

  return (
    <form className="groupmatch-form" onSubmit={submitResult}>
      <div className="groupmatch-scoreline">
        <MatchTeamHeader img={match.home.img} name={match.home.name} />
        <div className="groupmatch-scoreInput" aria-label="Match score">
          <input
            aria-label={`${match.home.name} score`}
            defaultValue={result?.home_score ?? 0}
            min={0}
            name="homeScore"
            type="number"
          />
          <span>:</span>
          <input
            aria-label={`${match.away.name} score`}
            defaultValue={result?.away_score ?? 0}
            min={0}
            name="awayScore"
            type="number"
          />
        </div>
        <MatchTeamHeader img={match.away.img} name={match.away.name} />
      </div>

      <button className="groupmatch-confirmButton" disabled={isSaving} type="submit">
        <span>确认结果</span>
        <span>{isSaving ? "Saving..." : "Confirm Result"}</span>
      </button>

      {errorMessage && <div className="groupmatch-error">{errorMessage}</div>}

      <div className="groupmatch-rosters">
        <MatchRosterTable
          matchStatsByPlayerKey={matchStatsByPlayerKey}
          players={homePlayers}
          startIndex={0}
          title={match.home.name}
        />
        <MatchRosterTable
          matchStatsByPlayerKey={matchStatsByPlayerKey}
          players={awayPlayers}
          startIndex={homePlayers.length}
          title={match.away.name}
        />
      </div>
    </form>
  );
}

function MatchTeamHeader({ img, name }: { img: string; name: string }) {
  return (
    <div className="groupmatch-teamHeader">
      <img src={img} alt={name} />
      <span>{name}</span>
    </div>
  );
}

function MatchRosterTable({
  matchStatsByPlayerKey,
  players,
  startIndex,
  title,
}: {
  matchStatsByPlayerKey: Map<string, GroupMatchPlayerStatRow>;
  players: MatchPlayerRow[];
  startIndex: number;
  title: string;
}) {
  return (
    <section className="groupmatch-roster">
      <h3>{title}</h3>
      {players.length > 0 ? (
        <div className="groupmatch-player-table">
          <div className="groupmatch-player-head">
            <span>Player</span>
            <span>Yellow Card</span>
            <span>Red Card</span>
            <span>Goal</span>
            <span>Assist</span>
          </div>
          {players.map((player, index) => {
            const matchStat = matchStatsByPlayerKey.get(player.player_key);

            return (
              <div
                className="groupmatch-player-row"
                key={player.player_key}
                style={{ animationDelay: `${760 + (startIndex + index) * 70}ms` }}
              >
                <div className="groupmatch-player-cell">
                  {player.avatar_url && (
                    <img src={player.avatar_url} alt={player.name} />
                  )}
                  <span>{player.name}</span>
                </div>
                <StatInput
                  label={`${player.name} yellow card`}
                  name={`${player.player_key}:yellow_card`}
                  value={matchStat?.yellow_card ?? 0}
                />
                <StatInput
                  label={`${player.name} red card`}
                  name={`${player.player_key}:red_card`}
                  value={matchStat?.red_card ?? 0}
                />
                <StatInput
                  label={`${player.name} goal`}
                  name={`${player.player_key}:goals`}
                  value={matchStat?.goals ?? 0}
                />
                <StatInput
                  label={`${player.name} assist`}
                  name={`${player.player_key}:assists`}
                  value={matchStat?.assists ?? 0}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="groupmatch-empty">No players confirmed.</div>
      )}
    </section>
  );
}

function StatInput({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: number;
}) {
  return (
    <input
      aria-label={label}
      className="groupmatch-statInput"
      defaultValue={value}
      min={0}
      name={name}
      type="number"
    />
  );
}
