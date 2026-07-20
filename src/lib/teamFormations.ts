export type TeamRole = "defend" | "balanced" | "attack";

export interface FormationSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  defaultRole: TeamRole;
}

export interface FormationDefinition {
  label: string;
  slots: FormationSlot[];
}

type Position = readonly [id: string, role?: TeamRole];

const DISPLAY_ROLE_BY_SLOT: Record<string, string> = {
  CB: "CB",
  CDM: "CDM",
  CF: "ST",
  GK: "GK",
  LAM: "CAM",
  LB: "LB",
  LCB: "CB",
  LCDM: "CDM",
  LCM: "CM",
  LM: "LM",
  LST: "ST",
  LWB: "LB",
  RAM: "CAM",
  RB: "RB",
  RCB: "CB",
  RCDM: "CDM",
  RCM: "CM",
  RM: "RM",
  RST: "ST",
  RWB: "RB",
  ST: "ST",
  CAM: "CAM",
  CM: "CM",
  LW: "LW",
  RW: "RW",
};

const displayRole = (slotId: string) => DISPLAY_ROLE_BY_SLOT[slotId] ?? slotId;

const line = (y: number, positions: readonly Position[]): FormationSlot[] => {
  const spacing = 100 / (positions.length + 1);

  return positions.map(([id, defaultRole = "balanced"], index) => ({
    id,
    label: displayRole(id),
    x: spacing * (index + 1),
    y,
    defaultRole,
  }));
};

const formation = (
  label: string,
  rows: ReadonlyArray<readonly [y: number, positions: readonly Position[]]>,
): FormationDefinition => ({
  label,
  slots: rows.flatMap(([y, positions]) => line(y, positions)),
});

const goalkeeper: Position[] = [["GK", "defend"]];
const backFour: Position[] = [
  ["LB", "defend"],
  ["LCB", "defend"],
  ["RCB", "defend"],
  ["RB", "defend"],
];
const backThree: Position[] = [
  ["LCB", "defend"],
  ["CB", "defend"],
  ["RCB", "defend"],
];
const backFive: Position[] = [
  ["LWB", "attack"],
  ["LCB", "defend"],
  ["CB", "defend"],
  ["RCB", "defend"],
  ["RWB", "attack"],
];
const frontThree: Position[] = [
  ["LW", "attack"],
  ["ST", "attack"],
  ["RW", "attack"],
];
const frontTwo: Position[] = [
  ["LST", "attack"],
  ["RST", "attack"],
];

export const TEAM_FORMATIONS = {
  "3-4-3-flat": formation("3-4-3 平行", [
    [90, goalkeeper],
    [76, backThree],
    [52, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, frontThree],
  ]),
  "3-4-1-2": formation("3-4-1-2", [
    [90, goalkeeper],
    [76, backThree],
    [56, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [37, [["CAM", "attack"]]],
    [18, frontTwo],
  ]),
  "3-4-2-1": formation("3-4-2-1", [
    [90, goalkeeper],
    [76, backThree],
    [58, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [38, [["LAM", "attack"], ["RAM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "3-1-4-2": formation("3-1-4-2", [
    [90, goalkeeper],
    [78, backThree],
    [65, [["CDM", "defend"]]],
    [47, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, frontTwo],
  ]),
  "3-5-2": formation("3-5-2", [
    [90, goalkeeper],
    [78, backThree],
    [58, [["LWB", "attack"], ["CDM", "defend"], ["CM"], ["RWB", "attack"]]],
    [42, [["CAM", "attack"]]],
    [18, frontTwo],
  ]),
  "4-3-3-attack": formation("4-3-3 进攻", [
    [90, goalkeeper],
    [76, backFour],
    [53, [["LCM"], ["CAM", "attack"], ["RCM"]]],
    [18, frontThree],
  ]),
  "4-3-3-flat": formation("4-3-3 平行", [
    [90, goalkeeper],
    [76, backFour],
    [52, [["LCM"], ["CM"], ["RCM"]]],
    [18, frontThree],
  ]),
  "4-3-1-2": formation("4-3-1-2", [
    [90, goalkeeper],
    [76, backFour],
    [56, [["LCM"], ["CM"], ["RCM"]]],
    [38, [["CAM", "attack"]]],
    [18, frontTwo],
  ]),
  "4-3-2-1": formation("4-3-2-1", [
    [90, goalkeeper],
    [76, backFour],
    [58, [["LCM"], ["CM"], ["RCM"]]],
    [38, [["LAM", "attack"], ["RAM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "4-5-1-attack": formation("4-5-1 进攻", [
    [90, goalkeeper],
    [78, backFour],
    [51, [["LM", "attack"], ["LCM"], ["CAM", "attack"], ["RCM"], ["RM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "4-3-3-possession": formation("4-3-3 控球", [
    [90, goalkeeper],
    [76, backFour],
    [53, [["LCM"], ["CDM", "defend"], ["RCM"]]],
    [18, frontThree],
  ]),
  "4-5-1-flat": formation("4-5-1 平行", [
    [90, goalkeeper],
    [78, backFour],
    [50, [["LM", "attack"], ["LCM"], ["CM"], ["RCM"], ["RM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "4-4-2-flat": formation("4-4-2 平行", [
    [90, goalkeeper],
    [76, backFour],
    [52, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, frontTwo],
  ]),
  "4-4-1-1-midfield": formation("4-4-1-1 中场", [
    [90, goalkeeper],
    [77, backFour],
    [54, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [35, [["CF", "attack"]]],
    [17, [["ST", "attack"]]],
  ]),
  "4-1-2-1-2-wide": formation("4-1-2-1-2 横向展开", [
    [90, goalkeeper],
    [78, backFour],
    [65, [["CDM", "defend"]]],
    [48, [["LM", "attack"], ["RM", "attack"]]],
    [34, [["CAM", "attack"]]],
    [17, frontTwo],
  ]),
  "4-1-2-1-2-narrow": formation("4-1-2-1-2 紧凑", [
    [90, goalkeeper],
    [78, backFour],
    [65, [["CDM", "defend"]]],
    [49, [["LCM"], ["RCM"]]],
    [34, [["CAM", "attack"]]],
    [17, frontTwo],
  ]),
  "4-3-3-holding": formation("4-3-3 防守", [
    [90, goalkeeper],
    [76, backFour],
    [62, [["CDM", "defend"]]],
    [48, [["LCM"], ["RCM"]]],
    [18, frontThree],
  ]),
  "4-4-2-possession": formation("4-4-2 控球", [
    [90, goalkeeper],
    [76, backFour],
    [53, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, frontTwo],
  ]),
  "4-2-4": formation("4-2-4", [
    [90, goalkeeper],
    [78, backFour],
    [59, [["LCDM", "defend"], ["RCDM", "defend"]]],
    [18, [["LW", "attack"], ["LST", "attack"], ["RST", "attack"], ["RW", "attack"]]],
  ]),
  "4-1-3-2": formation("4-1-3-2", [
    [90, goalkeeper],
    [78, backFour],
    [66, [["CDM", "defend"]]],
    [47, [["LCM"], ["CAM", "attack"], ["RCM"]]],
    [18, frontTwo],
  ]),
  "4-1-4-1": formation("4-1-4-1", [
    [90, goalkeeper],
    [78, backFour],
    [65, [["CDM", "defend"]]],
    [45, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "4-2-1-3": formation("4-2-1-3", [
    [90, goalkeeper],
    [78, backFour],
    [63, [["LCDM", "defend"], ["RCDM", "defend"]]],
    [43, [["CAM", "attack"]]],
    [18, frontThree],
  ]),
  "4-2-3-1-narrow": formation("4-2-3-1 紧凑", [
    [90, goalkeeper],
    [78, backFour],
    [64, [["LCDM", "defend"], ["RCDM", "defend"]]],
    [42, [["LAM", "attack"], ["CAM", "attack"], ["RAM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "4-2-3-1-wide": formation("4-2-3-1 横向展开", [
    [90, goalkeeper],
    [78, backFour],
    [64, [["LCDM", "defend"], ["RCDM", "defend"]]],
    [42, [["LM", "attack"], ["CAM", "attack"], ["RM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "5-2-3": formation("5-2-3", [
    [90, goalkeeper],
    [76, backFive],
    [50, [["LCM"], ["RCM"]]],
    [18, frontThree],
  ]),
  "5-2-1-2": formation("5-2-1-2", [
    [90, goalkeeper],
    [76, backFive],
    [53, [["LCM"], ["RCM"]]],
    [35, [["CAM", "attack"]]],
    [18, frontTwo],
  ]),
  "5-4-1-flat": formation("5-4-1 平行", [
    [90, goalkeeper],
    [77, backFive],
    [49, [["LM", "attack"], ["LCM"], ["RCM"], ["RM", "attack"]]],
    [18, [["ST", "attack"]]],
  ]),
  "5-3-2": formation("5-3-2 镇守", [
    [90, goalkeeper],
    [77, backFive],
    [51, [["LCM"], ["CM"], ["RCM"]]],
    [18, frontTwo],
  ]),
} as const satisfies Record<string, FormationDefinition>;

export type FormationKey = keyof typeof TEAM_FORMATIONS;

export function isFormationKey(value: string): value is FormationKey {
  return value in TEAM_FORMATIONS;
}
