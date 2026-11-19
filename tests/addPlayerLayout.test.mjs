import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("settings selected player information is stacked below the player card", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(
    css,
    /\.team-settings-selectedPlayer\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
  );
  assert.match(
    css,
    /\.team-settings-selectedPlayer\s*>\s*div\s*\{[^}]*justify-items:\s*center;[^}]*text-align:\s*center;/s,
  );
});
