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

const positionedSlot = (
  id: string,
  x: number,
  y: number,
  defaultRole: TeamRole = "balanced",
): FormationSlot => ({
  id,
  label: displayRole(id),
  x,
  y,
  defaultRole,
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
  "3-4-1-2": {
    label: "3-4-1-2",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LCB", 30, 77, "defend"),
      positionedSlot("CB", 50, 72, "defend"),
      positionedSlot("RCB", 70, 77, "defend"),
      positionedSlot("LM", 14, 48, "attack"),
      positionedSlot("LCM", 35, 57),
      positionedSlot("RCM", 65, 57),
      positionedSlot("RM", 86, 48, "attack"),
      positionedSlot("CAM", 50, 37, "attack"),
      positionedSlot("LST", 38, 18, "attack"),
      positionedSlot("RST", 62, 18, "attack"),
    ],
  },
  "3-4-2-1": {
    label: "3-4-2-1",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LCB", 33, 74, "defend"),
      positionedSlot("CB", 50, 68, "defend"),
      positionedSlot("RCB", 67, 74, "defend"),
      positionedSlot("LM", 14, 45, "attack"),
      positionedSlot("LCM", 39, 53),
      positionedSlot("RCM", 61, 53),
      positionedSlot("RM", 86, 45, "attack"),
      positionedSlot("LAM", 35, 28, "attack"),
      positionedSlot("RAM", 65, 28, "attack"),
      positionedSlot("ST", 50, 16, "attack"),
    ],
  },
  "3-1-4-2": {
    label: "3-1-4-2",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LCB", 25, 78, "defend"),
      positionedSlot("CB", 50, 74, "defend"),
      positionedSlot("RCB", 75, 78, "defend"),
      positionedSlot("CDM", 50, 60, "defend"),
      positionedSlot("LM", 20, 47, "attack"),
      positionedSlot("LCM", 40, 47),
      positionedSlot("RCM", 60, 47),
      positionedSlot("RM", 80, 47, "attack"),
      positionedSlot("LST", 100 / 3, 18, "attack"),
      positionedSlot("RST", 200 / 3, 18, "attack"),
    ],
  },
  "3-5-2": formation("3-5-2", [
    [90, goalkeeper],
    [78, backThree],
    [58, [["LWB", "attack"], ["CDM", "defend"], ["CM"], ["RWB", "attack"]]],
    [42, [["CAM", "attack"]]],
    [18, frontTwo],
  ]),
  "4-3-3-attack": {
    label: "4-3-3 进攻",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LB", 15, 80, "defend"),
      positionedSlot("LCB", 39, 83, "defend"),
      positionedSlot("RCB", 61, 83, "defend"),
      positionedSlot("RB", 85, 80, "defend"),
      positionedSlot("LCM", 33, 55),
      positionedSlot("CAM", 50, 40, "attack"),
      positionedSlot("RCM", 67, 55),
      positionedSlot("LW", 16, 14, "attack"),
      positionedSlot("ST", 50, 10, "attack"),
      positionedSlot("RW", 84, 14, "attack"),
    ],
  },
  "4-3-3-flat": {
    label: "4-3-3 平行",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 72, "defend"),
      positionedSlot("LCB", 40, 76, "defend"),
      positionedSlot("RCB", 60, 76, "defend"),
      positionedSlot("RB", 80, 72, "defend"),
      positionedSlot("LCM", 30, 52),
      positionedSlot("CM", 50, 52),
      positionedSlot("RCM", 70, 52),
      positionedSlot("LW", 25, 18, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
      positionedSlot("RW", 75, 18, "attack"),
    ],
  },
  "4-3-1-2": {
    label: "4-3-1-2",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 76, "defend"),
      positionedSlot("LCB", 40, 76, "defend"),
      positionedSlot("RCB", 60, 76, "defend"),
      positionedSlot("RB", 80, 76, "defend"),
      positionedSlot("LCM", 25, 52),
      positionedSlot("CM", 50, 56),
      positionedSlot("RCM", 75, 52),
      positionedSlot("CAM", 50, 38, "attack"),
      positionedSlot("LST", 100 / 3, 18, "attack"),
      positionedSlot("RST", 200 / 3, 18, "attack"),
    ],
  },
  "4-3-2-1": {
    label: "4-3-2-1",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 15, 76, "defend"),
      positionedSlot("LCB", 35, 76, "defend"),
      positionedSlot("RCB", 65, 76, "defend"),
      positionedSlot("RB", 85, 76, "defend"),
      positionedSlot("LCM", 34, 53),
      positionedSlot("CM", 50, 58),
      positionedSlot("RCM", 66, 53),
      positionedSlot("LAM", 31, 30, "attack"),
      positionedSlot("RAM", 69, 30, "attack"),
      positionedSlot("ST", 50, 14, "attack"),
    ],
  },
  "4-5-1-attack": {
    label: "4-5-1 进攻",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 78, "defend"),
      positionedSlot("LCB", 40, 78, "defend"),
      positionedSlot("RCB", 60, 78, "defend"),
      positionedSlot("RB", 80, 78, "defend"),
      positionedSlot("LM", 20, 51, "attack"),
      positionedSlot("LAM", 35, 36, "attack"),
      positionedSlot("CM", 50, 51),
      positionedSlot("RAM", 65, 36, "attack"),
      positionedSlot("RM", 80, 51, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
    ],
  },
  "4-3-3-possession": {
    label: "4-3-3 控球",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 76, "defend"),
      positionedSlot("LCB", 40, 76, "defend"),
      positionedSlot("RCB", 60, 76, "defend"),
      positionedSlot("RB", 80, 76, "defend"),
      positionedSlot("LCM", 30, 48),
      positionedSlot("CDM", 50, 53, "defend"),
      positionedSlot("RCM", 70, 48),
      positionedSlot("LW", 18, 18, "attack"),
      positionedSlot("ST", 50, 12, "attack"),
      positionedSlot("RW", 82, 18, "attack"),
    ],
  },
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
  "4-4-1-1-midfield": {
    label: "4-4-1-1 中场",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 73, "defend"),
      positionedSlot("LCB", 40, 77, "defend"),
      positionedSlot("RCB", 60, 77, "defend"),
      positionedSlot("RB", 80, 73, "defend"),
      positionedSlot("LM", 20, 49, "attack"),
      positionedSlot("LCM", 40, 54),
      positionedSlot("RCM", 60, 54),
      positionedSlot("RM", 80, 49, "attack"),
      positionedSlot("CAM", 50, 35, "attack"),
      positionedSlot("ST", 50, 17, "attack"),
    ],
  },
  "4-1-2-1-2-wide": {
    label: "4-1-2-1-2 横向展开",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 15, 78, "defend"),
      positionedSlot("LCB", 35, 78, "defend"),
      positionedSlot("RCB", 65, 78, "defend"),
      positionedSlot("RB", 85, 78, "defend"),
      positionedSlot("CDM", 50, 65, "defend"),
      positionedSlot("LM", 12, 48, "attack"),
      positionedSlot("RM", 88, 48, "attack"),
      positionedSlot("CAM", 50, 34, "attack"),
      positionedSlot("LST", 100 / 3, 17, "attack"),
      positionedSlot("RST", 200 / 3, 17, "attack"),
    ],
  },
  "4-1-2-1-2-narrow": formation("4-1-2-1-2 紧凑", [
    [90, goalkeeper],
    [78, backFour],
    [65, [["CDM", "defend"]]],
    [49, [["LCM"], ["RCM"]]],
    [34, [["CAM", "attack"]]],
    [17, frontTwo],
  ]),
  "4-3-3-holding": {
    label: "4-3-3 防守",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LB", 15, 80, "defend"),
      positionedSlot("LCB", 39, 83, "defend"),
      positionedSlot("RCB", 61, 83, "defend"),
      positionedSlot("RB", 85, 80, "defend"),
      positionedSlot("LCDM", 33, 64, "defend"),
      positionedSlot("CM", 50, 49),
      positionedSlot("RCDM", 67, 64, "defend"),
      positionedSlot("LW", 16, 14, "attack"),
      positionedSlot("ST", 50, 10, "attack"),
      positionedSlot("RW", 84, 14, "attack"),
    ],
  },
  "4-4-2-possession": {
    label: "4-4-2 控球",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 72, "defend"),
      positionedSlot("LCB", 40, 76, "defend"),
      positionedSlot("RCB", 60, 76, "defend"),
      positionedSlot("RB", 80, 72, "defend"),
      positionedSlot("LM", 20, 48, "attack"),
      positionedSlot("LCDM", 40, 58, "defend"),
      positionedSlot("RCDM", 60, 58, "defend"),
      positionedSlot("RM", 80, 48, "attack"),
      positionedSlot("LST", 100 / 3, 18, "attack"),
      positionedSlot("RST", 200 / 3, 18, "attack"),
    ],
  },
  "4-2-2-2": {
    label: "4-2-2-2",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LB", 15, 80, "defend"),
      positionedSlot("LCB", 39, 83, "defend"),
      positionedSlot("RCB", 61, 83, "defend"),
      positionedSlot("RB", 85, 80, "defend"),
      positionedSlot("LCDM", 40, 62, "defend"),
      positionedSlot("RCDM", 60, 62, "defend"),
      positionedSlot("LAM", 28, 34, "attack"),
      positionedSlot("RAM", 72, 34, "attack"),
      positionedSlot("LST", 40, 18, "attack"),
      positionedSlot("RST", 60, 18, "attack"),
    ],
  },
  "4-2-4": {
    label: "4-2-4",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LB", 15, 78, "defend"),
      positionedSlot("LCB", 39, 78, "defend"),
      positionedSlot("RCB", 61, 78, "defend"),
      positionedSlot("RB", 85, 78, "defend"),
      positionedSlot("LCM", 40, 54),
      positionedSlot("RCM", 60, 54),
      positionedSlot("LW", 18, 26, "attack"),
      positionedSlot("LST", 42, 19, "attack"),
      positionedSlot("RST", 58, 19, "attack"),
      positionedSlot("RW", 82, 26, "attack"),
    ],
  },
  "4-1-3-2": {
    label: "4-1-3-2",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 15, 78, "defend"),
      positionedSlot("LCB", 35, 78, "defend"),
      positionedSlot("RCB", 65, 78, "defend"),
      positionedSlot("RB", 85, 78, "defend"),
      positionedSlot("CDM", 50, 66, "defend"),
      positionedSlot("LM", 18, 47, "attack"),
      positionedSlot("CM", 50, 47),
      positionedSlot("RM", 82, 47, "attack"),
      positionedSlot("LST", 38, 18, "attack"),
      positionedSlot("RST", 62, 18, "attack"),
    ],
  },
  "4-1-4-1": {
    label: "4-1-4-1",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 78, "defend"),
      positionedSlot("LCB", 40, 78, "defend"),
      positionedSlot("RCB", 60, 78, "defend"),
      positionedSlot("RB", 80, 78, "defend"),
      positionedSlot("CDM", 50, 61, "defend"),
      positionedSlot("LM", 20, 45, "attack"),
      positionedSlot("LCM", 40, 45),
      positionedSlot("RCM", 60, 45),
      positionedSlot("RM", 80, 45, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
    ],
  },
  "4-2-1-3": {
    label: "4-2-1-3",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 15, 74, "defend"),
      positionedSlot("LCB", 35, 78, "defend"),
      positionedSlot("RCB", 65, 78, "defend"),
      positionedSlot("RB", 85, 74, "defend"),
      positionedSlot("LCDM", 100 / 3, 59, "defend"),
      positionedSlot("RCDM", 200 / 3, 59, "defend"),
      positionedSlot("CAM", 50, 43, "attack"),
      positionedSlot("LW", 25, 18, "attack"),
      positionedSlot("ST", 50, 14, "attack"),
      positionedSlot("RW", 75, 18, "attack"),
    ],
  },
  "4-2-3-1-narrow": {
    label: "4-2-3-1 紧凑",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 15, 74, "defend"),
      positionedSlot("LCB", 35, 78, "defend"),
      positionedSlot("RCB", 65, 78, "defend"),
      positionedSlot("RB", 85, 74, "defend"),
      positionedSlot("LCDM", 100 / 3, 64, "defend"),
      positionedSlot("RCDM", 200 / 3, 64, "defend"),
      positionedSlot("LAM", 25, 42, "attack"),
      positionedSlot("CAM", 50, 42, "attack"),
      positionedSlot("RAM", 75, 42, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
    ],
  },
  "4-2-3-1-wide": {
    label: "4-2-3-1 横向展开",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LB", 20, 74, "defend"),
      positionedSlot("LCB", 40, 78, "defend"),
      positionedSlot("RCB", 60, 78, "defend"),
      positionedSlot("RB", 80, 74, "defend"),
      positionedSlot("LCDM", 100 / 3, 60, "defend"),
      positionedSlot("RCDM", 200 / 3, 60, "defend"),
      positionedSlot("LM", 18, 42, "attack"),
      positionedSlot("CAM", 50, 38, "attack"),
      positionedSlot("RM", 82, 42, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
    ],
  },
  "5-2-3": {
    label: "5-2-3",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LWB", 100 / 6, 72, "attack"),
      positionedSlot("LCB", 200 / 6, 76, "defend"),
      positionedSlot("CB", 50, 72, "defend"),
      positionedSlot("RCB", 400 / 6, 76, "defend"),
      positionedSlot("RWB", 500 / 6, 72, "attack"),
      positionedSlot("LCM", 100 / 3, 50),
      positionedSlot("RCM", 200 / 3, 50),
      positionedSlot("LW", 25, 22, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
      positionedSlot("RW", 75, 22, "attack"),
    ],
  },
  "5-2-1-2": {
    label: "5-2-1-2",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LWB", 100 / 6, 72, "attack"),
      positionedSlot("LCB", 200 / 6, 76, "defend"),
      positionedSlot("CB", 50, 72, "defend"),
      positionedSlot("RCB", 400 / 6, 76, "defend"),
      positionedSlot("RWB", 500 / 6, 72, "attack"),
      positionedSlot("LCM", 100 / 3, 53),
      positionedSlot("RCM", 200 / 3, 53),
      positionedSlot("CAM", 50, 35, "attack"),
      positionedSlot("LST", 100 / 3, 18, "attack"),
      positionedSlot("RST", 200 / 3, 18, "attack"),
    ],
  },
  "5-4-1-flat": {
    label: "5-4-1 平行",
    slots: [
      positionedSlot("GK", 50, 90, "defend"),
      positionedSlot("LWB", 100 / 6, 73, "attack"),
      positionedSlot("LCB", 200 / 6, 77, "defend"),
      positionedSlot("CB", 50, 73, "defend"),
      positionedSlot("RCB", 400 / 6, 77, "defend"),
      positionedSlot("RWB", 500 / 6, 73, "attack"),
      positionedSlot("LM", 20, 49, "attack"),
      positionedSlot("LCM", 40, 49),
      positionedSlot("RCM", 60, 49),
      positionedSlot("RM", 80, 49, "attack"),
      positionedSlot("ST", 50, 18, "attack"),
    ],
  },
  "5-3-2": {
    label: "5-3-2 镇守",
    slots: [
      positionedSlot("GK", 50, 94, "defend"),
      positionedSlot("LWB", 13, 78, "attack"),
      positionedSlot("LCB", 33, 82, "defend"),
      positionedSlot("CB", 50, 76, "defend"),
      positionedSlot("RCB", 67, 82, "defend"),
      positionedSlot("RWB", 87, 78, "attack"),
      positionedSlot("LCM", 35, 54),
  positionedSlot("CDM", 50, 56, "defend"),
      positionedSlot("RCM", 65, 54),
      positionedSlot("LST", 40, 19, "attack"),
      positionedSlot("RST", 60, 19, "attack"),
    ],
  },
} as const satisfies Record<string, FormationDefinition>;

export type FormationKey = keyof typeof TEAM_FORMATIONS;

export function isFormationKey(value: string): value is FormationKey {
  return value in TEAM_FORMATIONS;
}
