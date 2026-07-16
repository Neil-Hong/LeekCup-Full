import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuctionClient from "@/components/auction/AuctionClient";
import { AUCTION_COOKIE_NAME } from "@/lib/auctionAuth";
import { canAccessAuctionDisplay } from "@/lib/auctionRoles";
import { readActiveAuctionUserFromCookieValue } from "@/lib/auctionRest";

export const dynamic = "force-dynamic";

export default async function AuctionDisplayPage() {
  const cookieStore = await cookies();
  const user = await readActiveAuctionUserFromCookieValue(
    cookieStore.get(AUCTION_COOKIE_NAME)?.value,
  );

  if (!canAccessAuctionDisplay(user)) {
    redirect("/auction");
  }

  return <AuctionClient displayOnly />;
}
