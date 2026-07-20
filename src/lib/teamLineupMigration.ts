import type { TeamLineupSlot } from "./supabaseRest";
import type { FormationKey } from "./teamFormations";

const FORMATION_SLOT_MIGRATIONS: Partial<Record<FormationKey, Record<string, string>>> = {
  "4-3-3-holding": {
    LCM: "LCDM",
    CDM: "CM",
    RCM: "RCDM",
  },
  "4-5-1-attack": {
    LCM: "LAM",
    CAM: "CM",
    RCM: "RAM",
  },
  "4-4-1-1-midfield": {
    CF: "CAM",
  },
  "4-4-2-possession": {
    LCM: "LCDM",
    RCM: "RCDM",
  },
  "4-1-3-2": {
    LCM: "LM",
    CAM: "CM",
    RCM: "RM",
  },
  "4-2-4": {
    LCDM: "LCM",
    RCDM: "RCM",
  },
  "5-3-2": {
    CM: "CDM",
  },
};

export function normalizeSavedLineup(
  formation: FormationKey,
  savedLineup: TeamLineupSlot[],
) {
  const migrations = FORMATION_SLOT_MIGRATIONS[formation];
  if (!migrations) return savedLineup;

  return savedLineup.map((slot) => {
    const slotId = migrations[slot.slotId];
    if (!slotId) return slot;

    return {
      ...slot,
      slotId,
      playerRole: undefined,
      focus: undefined,
    };
  });
}
