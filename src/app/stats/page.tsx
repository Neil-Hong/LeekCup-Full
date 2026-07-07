import { TEAMS2 } from "@/data/teams2";
import {
  readPlayerLeaderboard,
  readStatsSummary,
  readTeamLeaderboard,
  type PlayerLeaderboardMetric,
  type PlayerLeaderboardRow,
  type StatsSummary,
  type TeamLeaderboardMetric,
  type TeamLeaderboardRow,
} from "@/lib/supabaseRest";
import StatsClient, {
  type StatRow,
  type StatsSummaryCardData,
  type TeamStatRow,
} from "./StatsClient";

const DEFAULT_PLAYER_IMAGE = "/images/Question.png";
const DEFAULT_TEAM_IMAGE = "/images/Question.png";
const PLACEHOLDER_ROW_COUNT = 6;

function createPlaceholderPlayerRows(): StatRow[] {
  return Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, index) => ({
    rank: index + 1,
    img: DEFAULT_PLAYER_IMAGE,
    name: "TBD",
    val: "0",
  }));
}

function createPlaceholderTeamRows(): TeamStatRow[] {
  return Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, index) => ({
    rank: index + 1,
    team: {
      name: "TBD",
      img: DEFAULT_TEAM_IMAGE,
    },
    val: "0",
  }));
}

function toPlayerRows(
  rows: PlayerLeaderboardRow[],
  metric: PlayerLeaderboardMetric,
): StatRow[] {
  if (rows.length === 0 || rows.every((row) => Number(row[metric] ?? 0) === 0)) {
    return createPlaceholderPlayerRows();
  }

  return rows.map((row, index) => ({
    rank: index + 1,
    img: row.avatar_url ?? DEFAULT_PLAYER_IMAGE,
    name: row.name,
    val: String(row[metric] ?? 0),
  }));
}

function findTeamImage(row: TeamLeaderboardRow) {
  return (
    Object.values(TEAMS2).find(
      (team) => team.sname === row.sname || team.name === row.name,
    )?.img ?? DEFAULT_TEAM_IMAGE
  );
}

function toTeamRows(
  rows: TeamLeaderboardRow[],
  metric: TeamLeaderboardMetric,
): TeamStatRow[] {
  if (rows.length === 0 || rows.every((row) => Number(row[metric] ?? 0) === 0)) {
    return createPlaceholderTeamRows();
  }

  return rows.map((row, index) => ({
    rank: index + 1,
    team: {
      name: row.name,
      img: findTeamImage(row),
    },
    val: String(row[metric] ?? 0),
  }));
}

function formatRate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return value.toFixed(2);
}

function toSummaryCards({
  completedMatches,
  totalAssists,
  totalGoals,
}: StatsSummary): StatsSummaryCardData {
  const goalsPerMatch = completedMatches > 0 ? totalGoals / completedMatches : 0;
  const goalsPerMinute =
    completedMatches > 0 ? totalGoals / (completedMatches * 90) : 0;
  const assistsPerMatch =
    completedMatches > 0 ? totalAssists / completedMatches : 0;
  const assistsPerMinute =
    completedMatches > 0 ? totalAssists / (completedMatches * 90) : 0;

  return {
    assistsPerMatch: formatRate(assistsPerMatch),
    assistsPerMinute: formatRate(assistsPerMinute),
    completedMatches,
    goalsPerMatch: formatRate(goalsPerMatch),
    goalsPerMinute: formatRate(goalsPerMinute),
    totalAssists,
    totalGoals,
  };
}

export default async function StatsPage() {
  const [
    summary,
    goals,
    assists,
    redCards,
    yellowCards,
    clubGoals,
    clubGoalsConceded,
  ] = await Promise.all([
    readStatsSummary(),
    readPlayerLeaderboard("goals"),
    readPlayerLeaderboard("assists"),
    readPlayerLeaderboard("red_card"),
    readPlayerLeaderboard("yellow_card"),
    readTeamLeaderboard("goals"),
    readTeamLeaderboard("conceded"),
  ]);

  return (
    <StatsClient
      summary={toSummaryCards(summary)}
      goalsData={toPlayerRows(goals, "goals")}
      assistsData={toPlayerRows(assists, "assists")}
      redCardsData={toPlayerRows(redCards, "red_card")}
      yellowCardsData={toPlayerRows(yellowCards, "yellow_card")}
      clubGoalsData={toTeamRows(clubGoals, "goals")}
      clubGoalsConcededData={toTeamRows(clubGoalsConceded, "conceded")}
    />
  );
}
