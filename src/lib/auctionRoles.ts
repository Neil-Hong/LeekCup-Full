export type AuctionUserRole = "admin" | "bidder" | "viewer";

export function isAuctionAdmin(role: AuctionUserRole) {
  return role === "admin";
}

export function isAuctionBidder(role: AuctionUserRole) {
  return role === "bidder";
}

export function isAuctionViewer(role: AuctionUserRole) {
  return role === "viewer";
}
