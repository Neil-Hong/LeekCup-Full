export interface GroupTeamRow {
  position_order: number;
  team_id: number;
  name: string;
  sname: string;
  img: string;
}

export interface Fc26PlayerSearchResult {
  player_key: string;
  isSelected: boolean;
  name: string;
  canonical_name: string;
  overall_rating: number;
  position: string;
  nation: string;
  nation_image_url: string | null;
  avatar_url: string | null;
  card_image_url: string | null;
  card_image_public_url: string | null;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface TeamPlayerRow extends Fc26PlayerSearchResult {
  source: string | null;
  source_player_id: string | null;
  card_kind: string | null;
  alternative_position: string[];
  transaction_price: number;
}

export interface MatchPlayerRow extends TeamPlayerRow {
  team_sname: string;
  yellow_card: number;
  red_card: number;
  goals: number;
  assists: number;
}

export interface GroupMatchResultRow {
  match_slug: string;
  group_name: "GroupA" | "GroupB" | "GroupPlayoffs";
  round: number;
  home_sname: string;
  away_sname: string;
  home_score: number;
  away_score: number;
}

export interface GroupMatchPlayerStatRow {
  match_slug: string;
  player_key: string;
  team_sname: string;
  yellow_card: number;
  red_card: number;
  goals: number;
  assists: number;
}

export interface PlayerMatchStatInput {
  player_key: string;
  team_sname: string;
  yellow_card: number;
  red_card: number;
  goals: number;
  assists: number;
}

export type PlayerLeaderboardMetric =
  | "goals"
  | "assists"
  | "red_card"
  | "yellow_card";

export type TeamLeaderboardMetric = "goals" | "conceded";

export interface PlayerLeaderboardRow {
  player_key: string;
  name: string;
  avatar_url: string | null;
  goals: number;
  assists: number;
  red_card: number;
  yellow_card: number;
}

export interface TeamLeaderboardRow {
  name: string;
  sname: string;
  goals: number;
  conceded: number;
}

export interface StatsSummary {
  completedMatches: number;
  totalAssists: number;
  totalGoals: number;
}

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseServerConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

function getSupabaseServerConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    restUrl: `${supabaseUrl.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey,
  };
}

export async function readGroupTable(tableName: "GroupA" | "GroupB") {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl, serviceRoleKey } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/${tableName}?select=*&order=position_order.asc`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read ${tableName}: ${await response.text()}`);
  }

  return (await response.json()) as GroupTeamRow[];
}

export async function replaceGroupTable(
  tableName: "GroupA" | "GroupB",
  teams: GroupTeamRow[],
) {
  const { restUrl, serviceRoleKey } = getSupabaseServerConfig();
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  const insertResponse = await fetch(`${restUrl}/${tableName}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(teams),
  });

  if (!insertResponse.ok) {
    throw new Error(
      `Failed to insert ${tableName}: ${await insertResponse.text()}`,
    );
  }
}

export async function searchFc26Players(query: string) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const { restUrl, serviceRoleKey } = getSupabaseServerConfig();
  const wildcardQuery = trimmedQuery.replace(/[%*(),]/g, "");

  if (wildcardQuery.length < 2) {
    return [];
  }
  const select = [
    "player_key",
    "isSelected",
    "name",
    "canonical_name",
    "overall_rating",
    "position",
    "nation",
    "nation_image_url",
    "avatar_url",
    "card_image_url",
    "card_image_public_url",
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy",
  ].join(",");
  const filter = `(name.ilike.*${wildcardQuery}*,canonical_name.ilike.*${wildcardQuery}*)`;
  const response = await fetch(
    `${restUrl}/fc26_players?select=${select}&or=${encodeURIComponent(filter)}&order=overall_rating.desc.nullslast&limit=8`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to search players: ${await response.text()}`);
  }

  return (await response.json()) as Fc26PlayerSearchResult[];
}

function apiHeaders() {
  const { serviceRoleKey } = getSupabaseServerConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
}

export async function readTeamBudget(teamSname: string) {
  if (!hasSupabaseServerConfig()) {
    return 100000000;
  }

  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/teams?select=budget&sname=eq.${encodeURIComponent(teamSname)}&limit=1`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read team budget: ${await response.text()}`);
  }

  const rows = (await response.json()) as { budget: number }[];
  return rows[0]?.budget ?? 100000000;
}

export async function updateTeamBudget({
  budget,
  teamSname,
}: {
  budget: number;
  teamSname: string;
}) {
  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/teams?sname=eq.${encodeURIComponent(teamSname)}`,
    {
      method: "PATCH",
      headers: {
        ...apiHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ budget }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update team budget: ${await response.text()}`);
  }

  return budget;
}

async function readTeamScoreStats(teamSname: string) {
  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/teams?select=goals,conceded&sname=eq.${encodeURIComponent(teamSname)}&limit=1`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read team score stats: ${await response.text()}`);
  }

  const rows = (await response.json()) as { goals: number; conceded: number }[];
  return rows[0] ?? { goals: 0, conceded: 0 };
}

async function updateTeamScoreStats({
  teamSname,
  goalsDelta,
  concededDelta,
}: {
  teamSname: string;
  goalsDelta: number;
  concededDelta: number;
}) {
  if (goalsDelta === 0 && concededDelta === 0) {
    return;
  }

  const { restUrl } = getSupabaseServerConfig();
  const headers = apiHeaders();
  const current = await readTeamScoreStats(teamSname);
  const response = await fetch(
    `${restUrl}/teams?sname=eq.${encodeURIComponent(teamSname)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        goals: current.goals + goalsDelta,
        conceded: current.conceded + concededDelta,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update team score stats: ${await response.text()}`);
  }
}

export async function readGroupMatchResults() {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(`${restUrl}/groupMatchResults?select=*`, {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to read group match results: ${await response.text()}`);
  }

  return (await response.json()) as GroupMatchResultRow[];
}

export async function readGroupMatchResult(matchSlug: string) {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/groupMatchResults?select=*&match_slug=eq.${encodeURIComponent(matchSlug)}&limit=1`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read group match result: ${await response.text()}`);
  }

  const rows = (await response.json()) as GroupMatchResultRow[];
  return rows[0] ?? null;
}

export async function readGroupMatchPlayerStats(matchSlug: string) {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/groupMatchPlayerStats?select=*&match_slug=eq.${encodeURIComponent(matchSlug)}`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to read group match player stats: ${await response.text()}`,
    );
  }

  return (await response.json()) as GroupMatchPlayerStatRow[];
}

function sortLeaderboardRows<T extends { name: string }>(
  rows: T[],
  metric: keyof T,
) {
  return rows
    .sort((first, second) => {
      const firstValue = Number(first[metric] ?? 0);
      const secondValue = Number(second[metric] ?? 0);

      if (secondValue !== firstValue) {
        return secondValue - firstValue;
      }

      return first.name.localeCompare(second.name);
    })
    .slice(0, 6);
}

export async function readPlayerLeaderboard(metric: PlayerLeaderboardMetric) {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const select = [
    "player_key",
    "name",
    "avatar_url",
    "goals",
    "assists",
    "red_card",
    "yellow_card",
  ].join(",");
  const response = await fetch(`${restUrl}/selectedPlayer?select=${select}`, {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to read player leaderboard: ${await response.text()}`);
  }

  const rows = (await response.json()) as PlayerLeaderboardRow[];
  return sortLeaderboardRows(rows, metric);
}

export async function readTeamLeaderboard(metric: TeamLeaderboardMetric) {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const response = await fetch(
    `${restUrl}/teams?select=name,sname,goals,conceded`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read team leaderboard: ${await response.text()}`);
  }

  const rows = (await response.json()) as TeamLeaderboardRow[];
  return sortLeaderboardRows(rows, metric);
}

export async function readStatsSummary(): Promise<StatsSummary> {
  if (!hasSupabaseServerConfig()) {
    return {
      completedMatches: 0,
      totalAssists: 0,
      totalGoals: 0,
    };
  }

  const { restUrl } = getSupabaseServerConfig();
  const [matchResultsResponse, teamsResponse, selectedPlayersResponse] =
    await Promise.all([
      fetch(`${restUrl}/groupMatchResults?select=match_slug`, {
        headers: apiHeaders(),
        cache: "no-store",
      }),
      fetch(`${restUrl}/teams?select=goals`, {
        headers: apiHeaders(),
        cache: "no-store",
      }),
      fetch(`${restUrl}/selectedPlayer?select=assists`, {
        headers: apiHeaders(),
        cache: "no-store",
      }),
    ]);

  if (!matchResultsResponse.ok) {
    throw new Error(
      `Failed to read completed matches: ${await matchResultsResponse.text()}`,
    );
  }

  if (!teamsResponse.ok) {
    throw new Error(`Failed to read total goals: ${await teamsResponse.text()}`);
  }

  if (!selectedPlayersResponse.ok) {
    throw new Error(
      `Failed to read total assists: ${await selectedPlayersResponse.text()}`,
    );
  }

  const [matchResults, teams, selectedPlayers] = await Promise.all([
    matchResultsResponse.json() as Promise<{ match_slug: string }[]>,
    teamsResponse.json() as Promise<{ goals: number | null }[]>,
    selectedPlayersResponse.json() as Promise<{ assists: number | null }[]>,
  ]);

  return {
    completedMatches: matchResults.length,
    totalAssists: selectedPlayers.reduce(
      (total, player) => total + Number(player.assists ?? 0),
      0,
    ),
    totalGoals: teams.reduce(
      (total, team) => total + Number(team.goals ?? 0),
      0,
    ),
  };
}

export async function readTeamPlayers(teamSname: string) {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const select = [
    "player_key",
    "source",
    "source_player_id",
    "card_kind",
    "name",
    "canonical_name",
    "overall_rating",
    "position",
    "alternative_position",
    "nation",
    "nation_id",
    "nation_image_url",
    "avatar_url",
    "card_image_url",
    "card_image_public_url",
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy",
    "transaction_price",
  ].join(",");
  const response = await fetch(
    `${restUrl}/${encodeURIComponent(teamSname)}?select=${select}&order=overall_rating.desc.nullslast`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read team players: ${await response.text()}`);
  }

  return (await response.json()) as TeamPlayerRow[];
}

export async function readSelectedPlayersForTeam(teamSname: string) {
  if (!hasSupabaseServerConfig()) {
    return [];
  }

  const { restUrl } = getSupabaseServerConfig();
  const select = [
    "player_key",
    "team_sname",
    "source",
    "source_player_id",
    "card_kind",
    "name",
    "canonical_name",
    "overall_rating",
    "position",
    "alternative_position",
    "nation",
    "nation_id",
    "nation_image_url",
    "avatar_url",
    "card_image_url",
    "card_image_public_url",
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy",
    "transaction_price",
    "yellow_card",
    "red_card",
    "goals",
    "assists",
  ].join(",");
  const response = await fetch(
    `${restUrl}/selectedPlayer?select=${select}&team_sname=eq.${encodeURIComponent(teamSname)}&order=overall_rating.desc.nullslast`,
    {
      headers: apiHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read selected players: ${await response.text()}`);
  }

  return (await response.json()) as MatchPlayerRow[];
}

export async function saveGroupStageResult({
  awayScore,
  awaySname,
  groupName,
  homeScore,
  homeSname,
  matchSlug,
  playerStats,
  round,
}: {
  awayScore: number;
  awaySname: string;
  groupName: "GroupA" | "GroupB" | "GroupPlayoffs";
  homeScore: number;
  homeSname: string;
  matchSlug: string;
  playerStats: PlayerMatchStatInput[];
  round: number;
}) {
  const { restUrl } = getSupabaseServerConfig();
  const headers = apiHeaders();
  const [previous, previousPlayerStats] = await Promise.all([
    readGroupMatchResult(matchSlug),
    readGroupMatchPlayerStats(matchSlug),
  ]);
  const previousHomeScore = previous?.home_score ?? 0;
  const previousAwayScore = previous?.away_score ?? 0;
  const previousPlayerStatsByKey = new Map(
    previousPlayerStats.map((stat) => [stat.player_key, stat]),
  );

  await Promise.all(
    playerStats.map(async (stat) => {
      const previousStat = previousPlayerStatsByKey.get(stat.player_key);
      const deltas = {
        yellow_card: stat.yellow_card - (previousStat?.yellow_card ?? 0),
        red_card: stat.red_card - (previousStat?.red_card ?? 0),
        goals: stat.goals - (previousStat?.goals ?? 0),
        assists: stat.assists - (previousStat?.assists ?? 0),
      };

      if (
        deltas.yellow_card !== 0 ||
        deltas.red_card !== 0 ||
        deltas.goals !== 0 ||
        deltas.assists !== 0
      ) {
        const totalResponse = await fetch(
          `${restUrl}/selectedPlayer?select=yellow_card,red_card,goals,assists&player_key=eq.${encodeURIComponent(stat.player_key)}&limit=1`,
          {
            headers,
            cache: "no-store",
          },
        );

        if (!totalResponse.ok) {
          throw new Error(
            `Failed to read player totals: ${await totalResponse.text()}`,
          );
        }

        const [total] = (await totalResponse.json()) as Pick<
          MatchPlayerRow,
          "yellow_card" | "red_card" | "goals" | "assists"
        >[];

        const playerTotalResponse = await fetch(
          `${restUrl}/selectedPlayer?player_key=eq.${encodeURIComponent(stat.player_key)}`,
          {
            method: "PATCH",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              yellow_card: Math.max(0, (total?.yellow_card ?? 0) + deltas.yellow_card),
              red_card: Math.max(0, (total?.red_card ?? 0) + deltas.red_card),
              goals: Math.max(0, (total?.goals ?? 0) + deltas.goals),
              assists: Math.max(0, (total?.assists ?? 0) + deltas.assists),
            }),
          },
        );

        if (!playerTotalResponse.ok) {
          throw new Error(
            `Failed to update player totals: ${await playerTotalResponse.text()}`,
          );
        }
      }

      const matchStatResponse = await fetch(`${restUrl}/groupMatchPlayerStats`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          match_slug: matchSlug,
          player_key: stat.player_key,
          team_sname: stat.team_sname,
          yellow_card: stat.yellow_card,
          red_card: stat.red_card,
          goals: stat.goals,
          assists: stat.assists,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!matchStatResponse.ok) {
        throw new Error(
          `Failed to save player match stats: ${await matchStatResponse.text()}`,
        );
      }
    }),
  );

  const resultResponse = await fetch(`${restUrl}/groupMatchResults`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      match_slug: matchSlug,
      group_name: groupName,
      round,
      home_sname: homeSname,
      away_sname: awaySname,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!resultResponse.ok) {
    throw new Error(`Failed to save group match result: ${await resultResponse.text()}`);
  }

  await Promise.all([
    updateTeamScoreStats({
      teamSname: homeSname,
      goalsDelta: homeScore - previousHomeScore,
      concededDelta: awayScore - previousAwayScore,
    }),
    updateTeamScoreStats({
      teamSname: awaySname,
      goalsDelta: awayScore - previousAwayScore,
      concededDelta: homeScore - previousHomeScore,
    }),
  ]);
}

export async function addPlayerToTeam({
  teamSname,
  player,
  transactionPrice,
}: {
  teamSname: string;
  player: Fc26PlayerSearchResult;
  transactionPrice: number;
}) {
  const { restUrl } = getSupabaseServerConfig();
  const headers = apiHeaders();
  const playerResponse = await fetch(
    `${restUrl}/fc26_players?select=isSelected&player_key=eq.${encodeURIComponent(player.player_key)}&limit=1`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!playerResponse.ok) {
    throw new Error(`Failed to check player status: ${await playerResponse.text()}`);
  }

  const playerRows = (await playerResponse.json()) as { isSelected: boolean }[];

  if (playerRows[0]?.isSelected) {
    throw new Error("This player has been chose.");
  }

  const currentBudget = await readTeamBudget(teamSname);
  const nextBudget = currentBudget - transactionPrice;
  const payload = {
    player_key: player.player_key,
    source: null,
    source_player_id: null,
    card_kind: null,
    name: player.name,
    canonical_name: player.canonical_name,
    overall_rating: player.overall_rating,
    position: player.position,
    alternative_position: [],
    nation: player.nation,
    nation_id: null,
    nation_image_url: player.nation_image_url,
    avatar_url: player.avatar_url,
    card_image_url: player.card_image_url,
    card_image_public_url: player.card_image_public_url,
    pac: player.pac,
    sho: player.sho,
    pas: player.pas,
    dri: player.dri,
    def: player.def,
    phy: player.phy,
    transaction_price: transactionPrice,
  };

  const insertResponse = await fetch(`${restUrl}/${encodeURIComponent(teamSname)}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!insertResponse.ok) {
    throw new Error(`Failed to add player: ${await insertResponse.text()}`);
  }

  const budgetResponse = await fetch(
    `${restUrl}/teams?sname=eq.${encodeURIComponent(teamSname)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ budget: nextBudget }),
    },
  );

  if (!budgetResponse.ok) {
    throw new Error(`Failed to update budget: ${await budgetResponse.text()}`);
  }

  const selectedResponse = await fetch(
    `${restUrl}/fc26_players?player_key=eq.${encodeURIComponent(player.player_key)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ isSelected: true }),
    },
  );

  if (!selectedResponse.ok) {
    throw new Error(`Failed to update player status: ${await selectedResponse.text()}`);
  }

  const selectedPlayerResponse = await fetch(`${restUrl}/selectedPlayer`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      ...payload,
      team_sname: teamSname,
      yellow_card: 0,
      red_card: 0,
      goals: 0,
      assists: 0,
    }),
  });

  if (!selectedPlayerResponse.ok) {
    throw new Error(
      `Failed to add selected player: ${await selectedPlayerResponse.text()}`,
    );
  }

  return nextBudget;
}

export async function removePlayerFromTeam({
  teamSname,
  playerKey,
}: {
  teamSname: string;
  playerKey: string;
}) {
  const { restUrl } = getSupabaseServerConfig();
  const headers = apiHeaders();
  const deleteResponse = await fetch(
    `${restUrl}/${encodeURIComponent(teamSname)}?player_key=eq.${encodeURIComponent(playerKey)}`,
    {
      method: "DELETE",
      headers: {
        ...headers,
        Prefer: "return=minimal",
      },
    },
  );

  if (!deleteResponse.ok) {
    throw new Error(`Failed to remove player: ${await deleteResponse.text()}`);
  }

  const selectedResponse = await fetch(
    `${restUrl}/fc26_players?player_key=eq.${encodeURIComponent(playerKey)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ isSelected: false }),
    },
  );

  if (!selectedResponse.ok) {
    throw new Error(`Failed to reset player status: ${await selectedResponse.text()}`);
  }

  const selectedPlayerResponse = await fetch(
    `${restUrl}/selectedPlayer?player_key=eq.${encodeURIComponent(playerKey)}`,
    {
      method: "DELETE",
      headers: {
        ...headers,
        Prefer: "return=minimal",
      },
    },
  );

  if (!selectedPlayerResponse.ok) {
    throw new Error(
      `Failed to remove selected player: ${await selectedPlayerResponse.text()}`,
    );
  }
}

export async function removeAllPlayersFromTeam(teamSname: string) {
  const players = await readTeamPlayers(teamSname);

  if (players.length === 0) {
    return;
  }

  const { restUrl } = getSupabaseServerConfig();
  const headers = apiHeaders();
  const deleteTeamResponse = await fetch(
    `${restUrl}/${encodeURIComponent(teamSname)}?player_key=not.is.null`,
    {
      method: "DELETE",
      headers: {
        ...headers,
        Prefer: "return=minimal",
      },
    },
  );

  if (!deleteTeamResponse.ok) {
    throw new Error(
      `Failed to remove all team players: ${await deleteTeamResponse.text()}`,
    );
  }

  await Promise.all(
    players.map(async (player) => {
      const selectedResponse = await fetch(
        `${restUrl}/selectedPlayer?player_key=eq.${encodeURIComponent(player.player_key)}`,
        {
          method: "DELETE",
          headers: {
            ...headers,
            Prefer: "return=minimal",
          },
        },
      );

      if (!selectedResponse.ok) {
        throw new Error(
          `Failed to remove selected player: ${await selectedResponse.text()}`,
        );
      }

      const sourceResponse = await fetch(
        `${restUrl}/fc26_players?player_key=eq.${encodeURIComponent(player.player_key)}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ isSelected: false }),
        },
      );

      if (!sourceResponse.ok) {
        throw new Error(
          `Failed to reset player status: ${await sourceResponse.text()}`,
        );
      }
    }),
  );
}
