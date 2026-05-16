import type { Team } from "@/types";

const P = (name: string) => `/images/${name}`;

export const TEAMS: Record<number, Team> = {
  1: { name: "A.C. Milan", img: P("AC.png") },
  2: { name: "Manchester City F.C.", img: P("MC.png") },
  3: { name: "Chelsea F.C.", img: P("Chelsea.png") },
  4: { name: "Paris Saint-Germain F.C.", img: P("PSG.png") },
  5: { name: "FC Barcelona", img: P("Barcelona.png") },
  6: { name: "Liverpool F.C.", img: P("Liverpool.png") },
  7: { name: "Crystal Palace F.C.", img: P("CP.png") },
  8: { name: "Sunderland A.F.C.", img: P("Sunderland.png") },
  9: { name: "Manchester United F.C.", img: P("MU.png") },
  10: { name: "FC Bayern Munich", img: P("Bayern.png") },
  11: { name: "Real Madrid CF", img: P("RealMadrid.png") },
  12: { name: "Arsenal F.C.", img: P("Arsenal.png") },
  13: { name: "Birmingham City F.C.", img: P("Birmingham.png") },
  14: { name: "Eintracht Frankfurt", img: P("Frankfurt.png") },
  15: { name: "Stade Brestois 29", img: P("SB29.png") },
  16: { name: "Villarreal CF", img: P("Villarreal_CF.png") },
  17: { name: "Inter Milan", img: P("InterMilan.png") },
  18: { name: "Newcastle United", img: P("Newcastle.png") },
  19: { name: "Wolverhampton Wanderers F.C.", img: P("Wolverhampton.png") },
  20: { name: "S.S. Lazio", img: P("Lazio.png") },
  21: { name: "Aston Villa F.C.", img: P("Aston_Villa.png") },
  22: { name: "Southampton F.C.", img: P("Southampton.png") },
  23: { name: "Brighton & Hove Albion F.C.", img: P("Brighton.png") },
  24: { name: "Club Brugge KV", img: P("Club_Brugge.png") },
};

export const STAGE_1 = [
  P("AC.png"), P("Barcelona.png"), P("Chelsea.png"), P("MC.png"),
  P("Sunderland.png"), P("Liverpool.png"), P("PSG.png"), P("CP.png"),
];

export const STAGE_2 = [
  P("RealMadrid.png"), P("Arsenal.png"), P("SB29.png"), P("Birmingham.png"),
  P("Villarreal_CF.png"), P("Bayern.png"), P("Frankfurt.png"), P("MU.png"),
];

export const STAGE_3 = [
  P("Club_Brugge.png"), P("InterMilan.png"), P("Wolverhampton.png"), P("Newcastle.png"),
  P("Aston_Villa.png"), P("Brighton.png"), P("Southampton.png"), P("Lazio.png"),
];

export const ROUND16_UPPER: Record<number, Team> = {
  1: { name: "Real Madrid", img: P("RealMadrid.png") },
  2: { name: "Club Brugge KV", img: P("Club_Brugge.png") },
  3: { name: "Chelasea", img: P("Chelsea.png") },
  4: { name: "Villarreal CF", img: P("Villarreal_CF.png") },
  5: { name: "Birmingham City F.C.", img: P("Birmingham.png") },
  6: { name: "Brighton & Hove Albion F.C.", img: P("Brighton.png") },
  7: { name: "Southampton F.C.", img: P("Southampton.png") },
  8: { name: "Liverpool F.C.", img: P("Liverpool.png") },
  9: { name: "Wolverhampton", img: P("Wolverhampton.png") },
  10: { name: "NewCastel", img: P("Newcastle.png") },
  11: { name: "A.C. Milan", img: P("AC.png") },
  12: { name: "FC Bayern Munich", img: P("Bayern.png") },
};

export const ROUND16_LOWER: Record<number, Team> = {
  1: { name: "Sunderland A.F.C.", img: P("Sunderland.png") },
  2: { name: "Manchester United", img: P("MU.png") },
  3: { name: "Crystal Palace F.C.", img: P("CP.png") },
  4: { name: "Stade Brestois 29", img: P("SB29.png") },
  5: { name: "Paris Saint-Germain F.C.", img: P("PSG.png") },
  6: { name: "Manchester City", img: P("MC.png") },
  7: { name: "Eintracht Frankfurt", img: P("Frankfurt.png") },
  8: { name: "S.S. Lazio", img: P("Lazio.png") },
  9: { name: "Aston Villa F.C.", img: P("Aston_Villa.png") },
  10: { name: "FC Barcelona", img: P("Barcelona.png") },
  11: { name: "Arsenal F.C.", img: P("Arsenal.png") },
  12: { name: "InterMilan", img: P("InterMilan.png") },
};

export const ROUND3_UPPER: Record<number, Team> = {
  1: { name: "Wolverhampton", img: P("Wolverhampton.png") },
  2: { name: "Liverpool F.C.", img: P("Liverpool.png") },
  3: { name: "FC Bayern Munich", img: P("Bayern.png") },
  4: { name: "Villarreal CF", img: P("Villarreal_CF.png") },
  5: { name: "A.C. Milan", img: P("AC.png") },
  6: { name: "Brighton & Hove Albion F.C.", img: P("Brighton.png") },
};

export const ROUND3_MID: Record<number, Team> = {
  1: { name: "Eintracht Frankfurt(大礼包)", img: P("Frankfurt.png") },
  2: { name: "Manchester United", img: P("MU.png") },
  3: { name: "Crystal Palace F.C.", img: P("CP.png") },
  4: { name: "FC Barcelona", img: P("Barcelona.png") },
  5: { name: "Paris Saint-Germain F.C.", img: P("PSG.png") },
  6: { name: "Manchester City", img: P("MC.png") },
  7: { name: "Southampton F.C.", img: P("Southampton.png") },
  8: { name: "Club Brugge KV", img: P("Club_Brugge.png") },
  9: { name: "Real Madrid", img: P("RealMadrid.png") },
  10: { name: "NewCastel", img: P("Newcastle.png") },
  11: { name: "Birmingham City F.C.", img: P("Birmingham.png") },
  12: { name: "Chelasea", img: P("Chelsea.png") },
};

export const ROUND3_LOWER: Record<number, Team> = {
  1: { name: "Sunderland A.F.C.", img: P("Sunderland.png") },
  2: { name: "S.S. Lazio", img: P("Lazio.png") },
  3: { name: "Aston Villa F.C.", img: P("Aston_Villa.png") },
  4: { name: "Stade Brestois 29", img: P("SB29.png") },
  5: { name: "Arsenal F.C.", img: P("Arsenal.png") },
  6: { name: "InterMilan", img: P("InterMilan.png") },
};

export const ROUND4_PLAYOFF: Record<number, Team> = {
  1: { name: "Wolverhampton Wanderers F.C.", img: P("Wolverhampton.png") },
  2: { name: "Villarreal CF", img: P("Villarreal_CF.png") },
  3: { name: "FC Bayern Munich", img: P("Bayern.png") },
  4: { name: "Aston Villa F.C.", img: P("Aston_Villa.png") },
  5: { name: "Arsenal F.C.", img: P("Arsenal.png") },
  6: { name: "Sunderland A.F.C.", img: P("Sunderland.png") },
};

export const ROUND4_MATCHES: Record<number, Team> = {
  1: { name: "Liverpool F.C.", img: P("Liverpool.png") },
  2: { name: "Manchester United F.C.", img: P("MU.png") },
  3: { name: "Paris Saint-Germain F.C.", img: P("PSG.png") },
  4: { name: "S.S. Lazio", img: P("Lazio.png") },
  5: { name: "Brighton & Hove Albion F.C.", img: P("Brighton.png") },
  6: { name: "FC Barcelona", img: P("Barcelona.png") },
  7: { name: "A.C. Milan", img: P("AC.png") },
  8: { name: "Crystal Palace F.C.", img: P("CP.png") },
  9: { name: "NewCastel", img: P("Newcastle.png") },
  10: { name: "Chelasea", img: P("Chelsea.png") },
  11: { name: "Manchester City", img: P("MC.png") },
  12: { name: "Birmingham City F.C.", img: P("Birmingham.png") },
  13: { name: "Club Brugge KV", img: P("Club_Brugge.png") },
  14: { name: "Stade Brestois 29", img: P("SB29.png") },
  15: { name: "Southampton F.C.", img: P("Southampton.png") },
  16: { name: "Inter Milan", img: P("InterMilan.png") },
  17: { name: "Eintracht Frankfurt", img: P("Frankfurt.png") },
  18: { name: "Real Madrid", img: P("RealMadrid.png") },
};
