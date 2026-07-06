import type { Team } from "@/types";

const P = (name: string) => `/images/${name}`;

export const TEAMS2: Record<number, Team> = {
  1: { name: "A.C. Milan", img: P("AC.png"), sname: "AC" },
  2: { name: "Manchester City F.C.", img: P("MC.png"), sname: "MC" },
  3: { name: "Chelsea F.C.", img: P("Chelsea.png"), sname: "Chelsea" },
  4: { name: "Paris Saint-Germain F.C.", img: P("PSG.png"), sname: "PSG" },
  5: { name: "FC Barcelona", img: P("Barcelona.png"), sname: "Barcelona" },
  6: { name: "Liverpool F.C.", img: P("Liverpool.png"), sname: "Liverpool" },
  7: { name: "Crystal Palace F.C.", img: P("CP.png"), sname: "Crystal" },
  8: {
    name: "Sunderland A.F.C.",
    img: P("Sunderland.png"),
    sname: "Sunderland",
  },
  9: { name: "Manchester United F.C.", img: P("MU.png"), sname: "MU" },
  10: { name: "FC Bayern Munich", img: P("Bayern.png"), sname: "Bayern" },
  11: { name: "Real Madrid CF", img: P("RealMadrid.png"), sname: "RealMadrid" },
  12: { name: "Arsenal F.C.", img: P("Arsenal.png"), sname: "Arsenal" },
  13: {
    name: "Birmingham City F.C.",
    img: P("Birmingham.png"),
    sname: "Birmingham",
  },
  14: {
    name: "Eintracht Frankfurt",
    img: P("Frankfurt.png"),
    sname: "Frankfurt",
  },
  15: { name: "Stade Brestois 29", img: P("SB29.png"), sname: "SB29" },
  16: {
    name: "Villarreal CF",
    img: P("Villarreal_CF.png"),
    sname: "Villarreal",
  },
};
