export type AuctionUserRole = "admin" | "bidder";

export function isAuctionAdmin(role: AuctionUserRole) {
  return role === "admin";
}

export function isAuctionBidder(role: AuctionUserRole) {
  return role === "bidder";
}

export function canAccessAuctionDisplay(
  user: Pick<{ username: string; role: AuctionUserRole }, "username" | "role"> | null,
) {
  return user?.username === "afei" && isAuctionAdmin(user.role);
}
