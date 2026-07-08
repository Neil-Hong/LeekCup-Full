import type { GroupTeamRow } from "@/lib/supabaseRest";
import type { GroupMatchResultRow } from "@/lib/supabaseRest";

export type GroupName = "GroupA" | "GroupB" | "GroupPlayoffs";

export interface GroupMatch {
  group: GroupName;
  round: number;
  index: number;
  home: GroupTeamRow;
  away: GroupTeamRow;
  slug: string;
}

export interface GroupStandingRow {
  team: GroupTeamRow;
  points: number;
  goalDifference: number;
}

export function createMatchSlug(
  group: GroupName,
  round: number,
  index: number,
  homeSname: string,
  awaySname: string,
) {
  return `${group}-R${round}-M${index + 1}-${homeSname}-vs-${awaySname}`;
}

export function parseMatchSlug(slug: string) {
  const parts = slug.split("-");

  if (parts.length < 6) {
    return null;
  }

  const group =
    parts[0] === "GroupA" ||
    parts[0] === "GroupB" ||
    parts[0] === "GroupPlayoffs"
      ? parts[0]
      : null;
  const round = Number(parts[1]?.replace(/^R/, ""));
  const index = Number(parts[2]?.replace(/^M/, "")) - 1;
  const vsIndex = parts.indexOf("vs");
  const homeSname = parts.slice(3, vsIndex).join("-");
  const awaySname = parts.slice(vsIndex + 1).join("-");

  if (!group || !Number.isInteger(round) || !Number.isInteger(index) || vsIndex < 0) {
    return null;
  }

  return { group, round, index, homeSname, awaySname };
}

export function buildSingleRoundRobin(
  group: "GroupA" | "GroupB",
  teams: GroupTeamRow[],
) {
  if (teams.length < 2) {
    return [];
  }

  const rotation = [...teams];
  const rounds: GroupMatch[] = [];
  const roundCount = rotation.length - 1;
  const matchesPerRound = rotation.length / 2;

  for (let round = 1; round <= roundCount; round += 1) {
    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex += 1) {
      const first = rotation[matchIndex];
      const second = rotation[rotation.length - 1 - matchIndex];
      const home = round % 2 === 0 ? second : first;
      const away = round % 2 === 0 ? first : second;

      rounds.push({
        group,
        round,
        index: matchIndex,
        home,
        away,
        slug: createMatchSlug(group, round, matchIndex, home.sname, away.sname),
      });
    }

    const fixed = rotation[0];
    const moving = rotation.slice(1);
    moving.unshift(moving.pop() as GroupTeamRow);
    rotation.splice(0, rotation.length, fixed, ...moving);
  }

  return rounds;
}

export function buildGroupStandings(
  group: "GroupA" | "GroupB",
  teams: GroupTeamRow[],
  results: GroupMatchResultRow[],
) {
  const rowsBySname = new Map(
    teams.map((team) => [
      team.sname,
      {
        team,
        points: 0,
        goalDifference: 0,
      },
    ]),
  );
  const groupResults = results.filter((result) => result.group_name === group);

  for (const result of groupResults) {
    const home = rowsBySname.get(result.home_sname);
    const away = rowsBySname.get(result.away_sname);

    if (!home || !away) {
      continue;
    }

    home.goalDifference += result.home_score - result.away_score;
    away.goalDifference += result.away_score - result.home_score;

    if (result.home_score > result.away_score) {
      home.points += 3;
    } else if (result.home_score < result.away_score) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  const rows = Array.from(rowsBySname.values());

  if (groupResults.length === 0) {
    return rows.sort((first, second) =>
      first.team.name.localeCompare(second.team.name),
    );
  }

  return rows.sort((first, second) => {
    if (second.points !== first.points) {
      return second.points - first.points;
    }

    if (second.goalDifference !== first.goalDifference) {
      return second.goalDifference - first.goalDifference;
    }

    return first.team.name.localeCompare(second.team.name);
  });
}

export function buildGroupPlayoffMatches(
  groupAStandings: GroupStandingRow[],
  groupBStandings: GroupStandingRow[],
) {
  const pairings = [
    [groupAStandings[3]?.team, groupBStandings[6]?.team],
    [groupBStandings[3]?.team, groupAStandings[6]?.team],
    [groupAStandings[4]?.team, groupBStandings[5]?.team],
    [groupBStandings[4]?.team, groupAStandings[5]?.team],
  ];

  return pairings.flatMap(([home, away], index) => {
    if (!home || !away) {
      return [];
    }

    return [
      {
        group: "GroupPlayoffs" as const,
        round: 1,
        index,
        home,
        away,
        slug: createMatchSlug(
          "GroupPlayoffs",
          1,
          index,
          home.sname,
          away.sname,
        ),
      },
    ];
  });
}
