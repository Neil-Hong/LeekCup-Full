import assert from "node:assert/strict";
import test from "node:test";
import { TEAM_FORMATIONS } from "../src/lib/teamFormations.ts";

function slotPositions(formation) {
  return Object.fromEntries(
    TEAM_FORMATIONS[formation].slots.map(({ id, x, y, defaultRole }) => [
      id,
      { x, y, defaultRole },
    ]),
  );
}

function selectedSlots(formation, ids) {
  const positions = slotPositions(formation);
  return Object.fromEntries(ids.map((id) => [id, positions[id]]));
}

test("4-3-3 attack uses the staggered positions shown in the tactical reference", () => {
  const slots = TEAM_FORMATIONS["4-3-3-attack"].slots.map(
    ({ id, x, y, defaultRole }) => ({ id, x, y, defaultRole }),
  );

  assert.deepEqual(slots, [
    { id: "GK", x: 50, y: 94, defaultRole: "defend" },
    { id: "LB", x: 15, y: 80, defaultRole: "defend" },
    { id: "LCB", x: 39, y: 83, defaultRole: "defend" },
    { id: "RCB", x: 61, y: 83, defaultRole: "defend" },
    { id: "RB", x: 85, y: 80, defaultRole: "defend" },
    { id: "LCM", x: 33, y: 55, defaultRole: "balanced" },
    { id: "CAM", x: 50, y: 40, defaultRole: "attack" },
    { id: "RCM", x: 67, y: 55, defaultRole: "balanced" },
    { id: "LW", x: 16, y: 14, defaultRole: "attack" },
    { id: "ST", x: 50, y: 10, defaultRole: "attack" },
    { id: "RW", x: 84, y: 14, defaultRole: "attack" },
  ]);
});

test("requested formations use their adjusted tactical positions", () => {
  assert.deepEqual(slotPositions("3-1-4-2"), {
    GK: { x: 50, y: 90, defaultRole: "defend" },
    LCB: { x: 25, y: 78, defaultRole: "defend" },
    CB: { x: 50, y: 74, defaultRole: "defend" },
    RCB: { x: 75, y: 78, defaultRole: "defend" },
    CDM: { x: 50, y: 60, defaultRole: "defend" },
    LM: { x: 20, y: 47, defaultRole: "attack" },
    LCM: { x: 40, y: 47, defaultRole: "balanced" },
    RCM: { x: 60, y: 47, defaultRole: "balanced" },
    RM: { x: 80, y: 47, defaultRole: "attack" },
    LST: { x: 100 / 3, y: 18, defaultRole: "attack" },
    RST: { x: 200 / 3, y: 18, defaultRole: "attack" },
  });

  assert.deepEqual(slotPositions("4-3-1-2"), {
    GK: { x: 50, y: 90, defaultRole: "defend" },
    LB: { x: 20, y: 76, defaultRole: "defend" },
    LCB: { x: 40, y: 76, defaultRole: "defend" },
    RCB: { x: 60, y: 76, defaultRole: "defend" },
    RB: { x: 80, y: 76, defaultRole: "defend" },
    LCM: { x: 25, y: 52, defaultRole: "balanced" },
    CM: { x: 50, y: 56, defaultRole: "balanced" },
    RCM: { x: 75, y: 52, defaultRole: "balanced" },
    CAM: { x: 50, y: 38, defaultRole: "attack" },
    LST: { x: 100 / 3, y: 18, defaultRole: "attack" },
    RST: { x: 200 / 3, y: 18, defaultRole: "attack" },
  });

  assert.deepEqual(slotPositions("4-3-2-1"), {
    GK: { x: 50, y: 90, defaultRole: "defend" },
    LB: { x: 15, y: 76, defaultRole: "defend" },
    LCB: { x: 35, y: 76, defaultRole: "defend" },
    RCB: { x: 65, y: 76, defaultRole: "defend" },
    RB: { x: 85, y: 76, defaultRole: "defend" },
    LCM: { x: 34, y: 53, defaultRole: "balanced" },
    CM: { x: 50, y: 58, defaultRole: "balanced" },
    RCM: { x: 66, y: 53, defaultRole: "balanced" },
    LAM: { x: 31, y: 30, defaultRole: "attack" },
    RAM: { x: 69, y: 30, defaultRole: "attack" },
    ST: { x: 50, y: 14, defaultRole: "attack" },
  });

  assert.deepEqual(slotPositions("4-5-1-attack"), {
    GK: { x: 50, y: 90, defaultRole: "defend" },
    LB: { x: 20, y: 78, defaultRole: "defend" },
    LCB: { x: 40, y: 78, defaultRole: "defend" },
    RCB: { x: 60, y: 78, defaultRole: "defend" },
    RB: { x: 80, y: 78, defaultRole: "defend" },
    LM: { x: 20, y: 51, defaultRole: "attack" },
    LAM: { x: 35, y: 36, defaultRole: "attack" },
    CM: { x: 50, y: 51, defaultRole: "balanced" },
    RAM: { x: 65, y: 36, defaultRole: "attack" },
    RM: { x: 80, y: 51, defaultRole: "attack" },
    ST: { x: 50, y: 18, defaultRole: "attack" },
  });

  assert.deepEqual(slotPositions("4-3-3-possession"), {
    GK: { x: 50, y: 90, defaultRole: "defend" },
    LB: { x: 20, y: 76, defaultRole: "defend" },
    LCB: { x: 40, y: 76, defaultRole: "defend" },
    RCB: { x: 60, y: 76, defaultRole: "defend" },
    RB: { x: 80, y: 76, defaultRole: "defend" },
    LCM: { x: 30, y: 48, defaultRole: "balanced" },
    CDM: { x: 50, y: 53, defaultRole: "defend" },
    RCM: { x: 70, y: 48, defaultRole: "balanced" },
    LW: { x: 18, y: 18, defaultRole: "attack" },
    ST: { x: 50, y: 12, defaultRole: "attack" },
    RW: { x: 82, y: 18, defaultRole: "attack" },
  });
});

test("additional formations use the requested compact and advanced positions", () => {
  assert.deepEqual(selectedSlots("4-3-2-1", ["LCM", "RCM", "LAM", "RAM", "ST"]), {
    LCM: { x: 34, y: 53, defaultRole: "balanced" },
    RCM: { x: 66, y: 53, defaultRole: "balanced" },
    LAM: { x: 31, y: 30, defaultRole: "attack" },
    RAM: { x: 69, y: 30, defaultRole: "attack" },
    ST: { x: 50, y: 14, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-3-3-flat", ["LCM", "CM", "RCM"]), {
    LCM: { x: 30, y: 52, defaultRole: "balanced" },
    CM: { x: 50, y: 52, defaultRole: "balanced" },
    RCM: { x: 70, y: 52, defaultRole: "balanced" },
  });

  assert.deepEqual(selectedSlots("4-5-1-attack", ["LAM", "RAM"]), {
    LAM: { x: 35, y: 36, defaultRole: "attack" },
    RAM: { x: 65, y: 36, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-3-3-possession", ["LCM", "RCM"]), {
    LCM: { x: 30, y: 48, defaultRole: "balanced" },
    RCM: { x: 70, y: 48, defaultRole: "balanced" },
  });

  assert.deepEqual(selectedSlots("4-4-1-1-midfield", ["LB", "RB", "LM", "RM", "CAM", "ST"]), {
    LB: { x: 20, y: 73, defaultRole: "defend" },
    RB: { x: 80, y: 73, defaultRole: "defend" },
    LM: { x: 20, y: 49, defaultRole: "attack" },
    RM: { x: 80, y: 49, defaultRole: "attack" },
    CAM: { x: 50, y: 35, defaultRole: "attack" },
    ST: { x: 50, y: 17, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-1-2-1-2-wide", ["LB", "LCB", "RCB", "RB", "LM", "RM"]), {
    LB: { x: 15, y: 78, defaultRole: "defend" },
    LCB: { x: 35, y: 78, defaultRole: "defend" },
    RCB: { x: 65, y: 78, defaultRole: "defend" },
    RB: { x: 85, y: 78, defaultRole: "defend" },
    LM: { x: 12, y: 48, defaultRole: "attack" },
    RM: { x: 88, y: 48, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-4-2-possession", ["LM", "LCDM", "RCDM", "RM"]), {
    LM: { x: 20, y: 48, defaultRole: "attack" },
    LCDM: { x: 40, y: 58, defaultRole: "defend" },
    RCDM: { x: 60, y: 58, defaultRole: "defend" },
    RM: { x: 80, y: 48, defaultRole: "attack" },
  });
});

test("final formation adjustments update the requested defensive and wide positions", () => {
  assert.deepEqual(selectedSlots("4-4-2-possession", ["LB", "RB"]), {
    LB: { x: 20, y: 72, defaultRole: "defend" },
    RB: { x: 80, y: 72, defaultRole: "defend" },
  });

  assert.deepEqual(selectedSlots("4-1-3-2", ["LM", "CM", "RM"]), {
    LM: { x: 18, y: 47, defaultRole: "attack" },
    CM: { x: 50, y: 47, defaultRole: "balanced" },
    RM: { x: 82, y: 47, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-1-4-1", ["CDM"]), {
    CDM: { x: 50, y: 61, defaultRole: "defend" },
  });

  assert.deepEqual(selectedSlots("4-2-1-3", ["LB", "RB", "ST"]), {
    LB: { x: 15, y: 74, defaultRole: "defend" },
    RB: { x: 85, y: 74, defaultRole: "defend" },
    ST: { x: 50, y: 14, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("4-2-3-1-narrow", ["LB", "LCB", "RCB", "RB"]), {
    LB: { x: 15, y: 74, defaultRole: "defend" },
    LCB: { x: 35, y: 78, defaultRole: "defend" },
    RCB: { x: 65, y: 78, defaultRole: "defend" },
    RB: { x: 85, y: 74, defaultRole: "defend" },
  });

  assert.deepEqual(selectedSlots("4-2-3-1-wide", ["LB", "RB", "LCDM", "RCDM", "LM", "CAM", "RM"]), {
    LB: { x: 20, y: 74, defaultRole: "defend" },
    RB: { x: 80, y: 74, defaultRole: "defend" },
    LCDM: { x: 100 / 3, y: 60, defaultRole: "defend" },
    RCDM: { x: 200 / 3, y: 60, defaultRole: "defend" },
    LM: { x: 18, y: 42, defaultRole: "attack" },
    CAM: { x: 50, y: 38, defaultRole: "attack" },
    RM: { x: 82, y: 42, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("5-2-3", ["LWB", "CB", "RWB", "LW", "RW"]), {
    LWB: { x: 100 / 6, y: 72, defaultRole: "attack" },
    CB: { x: 50, y: 72, defaultRole: "defend" },
    RWB: { x: 500 / 6, y: 72, defaultRole: "attack" },
    LW: { x: 25, y: 22, defaultRole: "attack" },
    RW: { x: 75, y: 22, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("5-2-1-2", ["LWB", "CB", "RWB"]), {
    LWB: { x: 100 / 6, y: 72, defaultRole: "attack" },
    CB: { x: 50, y: 72, defaultRole: "defend" },
    RWB: { x: 500 / 6, y: 72, defaultRole: "attack" },
  });

  assert.deepEqual(selectedSlots("5-4-1-flat", ["LWB", "CB", "RWB"]), {
    LWB: { x: 100 / 6, y: 73, defaultRole: "attack" },
    CB: { x: 50, y: 73, defaultRole: "defend" },
    RWB: { x: 500 / 6, y: 73, defaultRole: "attack" },
  });
});

test("4-2-2-2 and its related formation adjustments use the requested spacing", () => {
  assert.deepEqual(selectedSlots("4-2-1-3", ["LB", "LCB", "RCB", "RB", "LCDM", "RCDM"]), {
    LB: { x: 15, y: 74, defaultRole: "defend" },
    LCB: { x: 35, y: 78, defaultRole: "defend" },
    RCB: { x: 65, y: 78, defaultRole: "defend" },
    RB: { x: 85, y: 74, defaultRole: "defend" },
    LCDM: { x: 100 / 3, y: 59, defaultRole: "defend" },
    RCDM: { x: 200 / 3, y: 59, defaultRole: "defend" },
  });

  assert.deepEqual(selectedSlots("4-1-3-2", ["LB", "LCB", "RCB", "RB", "LM", "RM", "LST", "RST"]), {
    LB: { x: 15, y: 78, defaultRole: "defend" },
    LCB: { x: 35, y: 78, defaultRole: "defend" },
    RCB: { x: 65, y: 78, defaultRole: "defend" },
    RB: { x: 85, y: 78, defaultRole: "defend" },
    LM: { x: 18, y: 47, defaultRole: "attack" },
    RM: { x: 82, y: 47, defaultRole: "attack" },
    LST: { x: 38, y: 18, defaultRole: "attack" },
    RST: { x: 62, y: 18, defaultRole: "attack" },
  });

  assert.deepEqual(slotPositions("4-2-2-2"), {
    GK: { x: 50, y: 94, defaultRole: "defend" },
    LB: { x: 15, y: 80, defaultRole: "defend" },
    LCB: { x: 39, y: 83, defaultRole: "defend" },
    RCB: { x: 61, y: 83, defaultRole: "defend" },
    RB: { x: 85, y: 80, defaultRole: "defend" },
    LCDM: { x: 40, y: 62, defaultRole: "defend" },
    RCDM: { x: 60, y: 62, defaultRole: "defend" },
    LAM: { x: 28, y: 34, defaultRole: "attack" },
    RAM: { x: 72, y: 34, defaultRole: "attack" },
    LST: { x: 40, y: 18, defaultRole: "attack" },
    RST: { x: 60, y: 18, defaultRole: "attack" },
  });
});
