import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessAuctionDisplay,
  isAuctionAdmin,
  isAuctionBidder,
} from "../src/lib/auctionRoles.ts";

test("only afei can access the protected auction display", () => {
  assert.equal(
    canAccessAuctionDisplay({ username: "afei", role: "admin" }),
    true,
  );
  assert.equal(
    canAccessAuctionDisplay({ username: "team1", role: "bidder" }),
    false,
  );
  assert.equal(
    canAccessAuctionDisplay({ username: "another-admin", role: "admin" }),
    false,
  );
  assert.equal(canAccessAuctionDisplay(null), false);
});

test("bidder and admin permissions remain distinct", () => {
  assert.equal(isAuctionBidder("bidder"), true);
  assert.equal(isAuctionAdmin("bidder"), false);
  assert.equal(isAuctionAdmin("admin"), true);
});
