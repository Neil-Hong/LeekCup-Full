import assert from "node:assert/strict";
import test from "node:test";
import {
  isAuctionAdmin,
  isAuctionBidder,
  isAuctionViewer,
} from "../src/lib/auctionRoles.ts";

test("viewer is display-only and cannot bid or administer auctions", () => {
  assert.equal(isAuctionViewer("viewer"), true);
  assert.equal(isAuctionBidder("viewer"), false);
  assert.equal(isAuctionAdmin("viewer"), false);
});

test("bidder and admin permissions remain distinct", () => {
  assert.equal(isAuctionBidder("bidder"), true);
  assert.equal(isAuctionAdmin("bidder"), false);
  assert.equal(isAuctionAdmin("admin"), true);
  assert.equal(isAuctionViewer("admin"), false);
});
