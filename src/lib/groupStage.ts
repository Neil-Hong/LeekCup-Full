import type { GroupTeamRow } from "@/lib/supabaseRest";
import type { GroupMatchResultRow } from "@/lib/supabaseRest";
import type { GroupMatchPlayerStatRow } from "@/lib/supabaseRest";

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
  goalsFor: number;
  goalDifference: number;
  fairPlayPoints: number;
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
  playerStats: GroupMatchPlayerStatRow[] = [],
) {
  const rowsBySname = new Map(
    teams.map((team) => [
      team.sname,
      {
        team,
        points: 0,
        goalsFor: 0,
        goalDifference: 0,
        fairPlayPoints: 0,
      },
    ]),
  );
  const groupResults = results.filter((result) => result.group_name === group);
  const groupResultSlugs = new Set(
    groupResults.map((result) => result.match_slug),
  );

  for (const result of groupResults) {
    const home = rowsBySname.get(result.home_sname);
    const away = rowsBySname.get(result.away_sname);

    if (!home || !away) {
      continue;
    }

    home.goalDifference += result.home_score - result.away_score;
    home.goalsFor += result.home_score;
    away.goalDifference += result.away_score - result.home_score;
    away.goalsFor += result.away_score;

    if (result.home_score > result.away_score) {
      home.points += 3;
    } else if (result.home_score < result.away_score) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  for (const stat of playerStats) {
    if (!groupResultSlugs.has(stat.match_slug)) {
      continue;
    }

    const row = rowsBySname.get(stat.team_sname);

    if (!row) {
      continue;
    }

    row.fairPlayPoints += stat.yellow_card + stat.red_card * 3;
  }

  const rows = Array.from(rowsBySname.values());

  if (groupResults.length === 0) {
    return rows.sort((first, second) =>
      first.team.name.localeCompare(second.team.name),
    );
  }

  return sortStandingsRows(rows, groupResults);
}

function sortStandingsRows(
  rows: GroupStandingRow[],
  groupResults: GroupMatchResultRow[],
) {
  const primarySortedRows = [...rows].sort(compareByPrimaryMetrics);
  const sortedRows: GroupStandingRow[] = [];

  for (let index = 0; index < primarySortedRows.length; index += 1) {
    const current = primarySortedRows[index];
    const tiedRows = [current];

    while (
      index + 1 < primarySortedRows.length &&
      primarySortedRows[index + 1].points === current.points &&
      primarySortedRows[index + 1].goalDifference === current.goalDifference
    ) {
      tiedRows.push(primarySortedRows[index + 1]);
      index += 1;
    }

    sortedRows.push(...sortTiedRows(tiedRows, groupResults));
  }

  return sortedRows;
}

function compareByPrimaryMetrics(
  first: GroupStandingRow,
  second: GroupStandingRow,
) {
  if (second.points !== first.points) {
    return second.points - first.points;
  }

  if (second.goalDifference !== first.goalDifference) {
    return second.goalDifference - first.goalDifference;
  }

  return first.team.name.localeCompare(second.team.name);
}

function sortTiedRows(
  rows: GroupStandingRow[],
  groupResults: GroupMatchResultRow[],
) {
  if (rows.length < 2) {
    return rows;
  }

  if (rows.length === 2) {
    return sortTwoTeamTie(rows, groupResults);
  }

  const tiedSnames = new Set(rows.map((row) => row.team.sname));
  const headToHeadRows = new Map(
    rows.map((row) => [
      row.team.sname,
      {
        row,
        points: 0,
        goalsFor: 0,
        goalDifference: 0,
      },
    ]),
  );

  for (const result of groupResults) {
    if (!tiedSnames.has(result.home_sname) || !tiedSnames.has(result.away_sname)) {
      continue;
    }

    const home = headToHeadRows.get(result.home_sname);
    const away = headToHeadRows.get(result.away_sname);

    if (!home || !away) {
      continue;
    }

    home.goalsFor += result.home_score;
    home.goalDifference += result.home_score - result.away_score;
    away.goalsFor += result.away_score;
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

  return Array.from(headToHeadRows.values()).sort((first, second) => {
    if (second.points !== first.points) {
      return second.points - first.points;
    }

    if (second.goalDifference !== first.goalDifference) {
      return second.goalDifference - first.goalDifference;
    }

    if (second.goalsFor !== first.goalsFor) {
      return second.goalsFor - first.goalsFor;
    }

    if (first.row.fairPlayPoints !== second.row.fairPlayPoints) {
      return first.row.fairPlayPoints - second.row.fairPlayPoints;
    }

    return first.row.team.name.localeCompare(second.row.team.name);
  }).map((entry) => entry.row);
}

function sortTwoTeamTie(
  rows: GroupStandingRow[],
  groupResults: GroupMatchResultRow[],
) {
  const [first, second] = rows;
  const headToHeadPoints = new Map([
    [first.team.sname, 0],
    [second.team.sname, 0],
  ]);

  for (const result of groupResults) {
    const isDirectMatch =
      (result.home_sname === first.team.sname &&
        result.away_sname === second.team.sname) ||
      (result.home_sname === second.team.sname &&
        result.away_sname === first.team.sname);

    if (!isDirectMatch) {
      continue;
    }

    if (result.home_score > result.away_score) {
      headToHeadPoints.set(
        result.home_sname,
        (headToHeadPoints.get(result.home_sname) ?? 0) + 3,
      );
    } else if (result.home_score < result.away_score) {
      headToHeadPoints.set(
        result.away_sname,
        (headToHeadPoints.get(result.away_sname) ?? 0) + 3,
      );
    } else {
      headToHeadPoints.set(
        result.home_sname,
        (headToHeadPoints.get(result.home_sname) ?? 0) + 1,
      );
      headToHeadPoints.set(
        result.away_sname,
        (headToHeadPoints.get(result.away_sname) ?? 0) + 1,
      );
    }
  }

  const firstHeadToHeadPoints = headToHeadPoints.get(first.team.sname) ?? 0;
  const secondHeadToHeadPoints = headToHeadPoints.get(second.team.sname) ?? 0;

  if (firstHeadToHeadPoints !== secondHeadToHeadPoints) {
    return firstHeadToHeadPoints > secondHeadToHeadPoints
      ? [first, second]
      : [second, first];
  }

  return [...rows].sort((firstRow, secondRow) => {
    if (firstRow.fairPlayPoints !== secondRow.fairPlayPoints) {
      return firstRow.fairPlayPoints - secondRow.fairPlayPoints;
    }

    return firstRow.team.name.localeCompare(secondRow.team.name);
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
