"use client";

import type { GroupMatch } from "@/lib/groupStage";
import type {
  GroupMatchPlayerStatRow,
  GroupMatchResultRow,
  MatchPlayerRow,
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
  const matchStatsByPlayerKey = new Map(
    matchPlayerStats.map((stat) => [stat.player_key, stat]),
  );

  return (
    <div className="groupmatch-form">
      <div className="groupmatch-scoreline">
        <MatchTeamHeader img={match.home.img} name={match.home.name} />
        <div className="groupmatch-scoreInput" aria-label="Match score">
          <input
            aria-label={`${match.home.name} score`}
            defaultValue={result?.home_score ?? 0}
            min={0}
            name="homeScore"
            readOnly
            type="number"
          />
          <span>:</span>
          <input
            aria-label={`${match.away.name} score`}
            defaultValue={result?.away_score ?? 0}
            min={0}
            name="awayScore"
            readOnly
            type="number"
          />
        </div>
        <MatchTeamHeader img={match.away.img} name={match.away.name} />
      </div>

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
    </div>
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
      readOnly
      type="number"
    />
  );
}
