import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSavedLineup } from "../src/lib/teamLineupMigration.ts";

test("4-3-3 holding migrates saved midfielders to its current slots", () => {
  const lineup = normalizeSavedLineup("4-3-3-holding", [
    { slotId: "LCM", playerKey: "left", role: "balanced" },
    { slotId: "CDM", playerKey: "middle", role: "defend" },
    { slotId: "RCM", playerKey: "right", role: "balanced" },
  ]);

  assert.deepEqual(lineup.map(({ slotId, playerKey, role }) => ({ slotId, playerKey, role })), [
    { slotId: "LCDM", playerKey: "left", role: "balanced" },
    { slotId: "CM", playerKey: "middle", role: "defend" },
    { slotId: "RCDM", playerKey: "right", role: "balanced" },
  ]);
});

test("4-5-1 attack preserves saved midfielders after its role changes", () => {
  const lineup = normalizeSavedLineup("4-5-1-attack", [
    { slotId: "LCM", playerKey: "left", role: "balanced" },
    { slotId: "CAM", playerKey: "middle", role: "attack" },
    { slotId: "RCM", playerKey: "right", role: "balanced" },
  ]);

  assert.deepEqual(lineup.map(({ slotId, playerKey, role }) => ({ slotId, playerKey, role })), [
    { slotId: "LAM", playerKey: "left", role: "balanced" },
    { slotId: "CM", playerKey: "middle", role: "attack" },
    { slotId: "RAM", playerKey: "right", role: "balanced" },
  ]);
});

test("role changes retain saved players in the new 4-4-1-1 and 4-4-2 slots", () => {
  assert.deepEqual(
    normalizeSavedLineup("4-4-1-1-midfield", [
      { slotId: "CF", playerKey: "attacking-midfielder", role: "attack" },
    ]).map(({ slotId, playerKey }) => ({ slotId, playerKey })),
    [{ slotId: "CAM", playerKey: "attacking-midfielder" }],
  );

  assert.deepEqual(
    normalizeSavedLineup("4-4-2-possession", [
      { slotId: "LCM", playerKey: "left", role: "balanced" },
      { slotId: "RCM", playerKey: "right", role: "balanced" },
    ]).map(({ slotId, playerKey }) => ({ slotId, playerKey })),
    [
      { slotId: "LCDM", playerKey: "left" },
      { slotId: "RCDM", playerKey: "right" },
    ],
  );
});

test("4-1-3-2 retains saved midfielders after its role changes", () => {
  const lineup = normalizeSavedLineup("4-1-3-2", [
    { slotId: "LCM", playerKey: "left", role: "balanced" },
    { slotId: "CAM", playerKey: "middle", role: "attack" },
    { slotId: "RCM", playerKey: "right", role: "balanced" },
  ]);

  assert.deepEqual(lineup.map(({ slotId, playerKey }) => ({ slotId, playerKey })), [
    { slotId: "LM", playerKey: "left" },
    { slotId: "CM", playerKey: "middle" },
    { slotId: "RM", playerKey: "right" },
  ]);
});
