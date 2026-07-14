import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  addPlayerToTeam,
  readTeamBudget,
  type Fc26PlayerSearchResult,
} from "@/lib/supabaseRest";
import {
  AUCTION_COOKIE_NAME,
  hashAuctionPassword,
  hashAuctionSessionSecret,
  readAuctionToken,
  type AuctionSessionUser,
} from "@/lib/auctionAuth";
import { isAuctionBidder, type AuctionUserRole } from "@/lib/auctionRoles";

type AuctionMode = "public" | "sealed";
type AuctionStatus = "idle" | "running" | "revealing" | "finished";
type AuctionPlayerStatus = "pending" | "active" | "sold" | "unsold";

interface AuctionUserRow {
  id: string;
  username: string;
  password_salt: string;
  password_hash: string;
  display_name: string;
  team_sname: string | null;
  role: AuctionUserRole;
  budget: number;
}

interface PublicAuctionUserRow {
  id: string;
  username: string;
  display_name: string;
  team_sname: string | null;
  role: AuctionUserRole;
  budget: number;
}

interface TeamBudgetRow {
  sname: string;
  budget: number;
}

interface AuctionUserSessionRow {
  id: string;
  user_id: string;
  session_token_hash: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
}

interface AuctionSessionRow {
  id: string;
  current_order: number | null;
  current_player_key: string | null;
  mode: AuctionMode;
  status: AuctionStatus;
  started_at: string | null;
  ends_at: string | null;
  tie_round: number | null;
  tie_team_snames: string[] | null;
  updated_at: string | null;
}

interface AuctionPlayerRow {
  auction_order: number;
  player_key: string;
  status: AuctionPlayerStatus;
  sold_to_user_id: string | null;
  sold_to_team_sname: string | null;
  sold_price: number | null;
  auction_mode: AuctionMode;
}

interface AuctionBidRow {
  id: string;
  session_id: string;
  player_key: string;
  user_id: string;
  team_sname: string;
  amount: number;
  mode: AuctionMode;
  is_winning: boolean;
  created_at: string;
}

interface AuctionResultRow {
  player_key: string;
  winner_team_sname: string | null;
  final_price: number | null;
}

export interface AuctionSetupUserInput {
  username: string;
  password: string;
  displayName: string;
  teamSname?: string | null;
  role: AuctionUserRole;
  budget?: number;
}

export interface AuctionState {
  currentUser: AuctionSessionUser | null;
  users: PublicAuctionUserRow[];
  session: AuctionSessionRow | null;
  auctionPlayer: AuctionPlayerRow | null;
  player: Fc26PlayerSearchResult | null;
  bids: Array<
    Pick<AuctionBidRow, "id" | "team_sname" | "user_id" | "created_at"> & {
      amount: number | null;
    }
  >;
  ownBid: AuctionBidRow | null;
  highestBid: AuctionBidRow | null;
  submittedBidCount: number;
  totalPlayers: number;
}

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLAYER_SOURCE_TABLE = "test_player";
const AUCTION_LOGIN_SESSION_MS = 12 * 60 * 60 * 1000;
const DEFAULT_AUCTION_BUDGET = 100000000;

function getConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server configuration.");
  }

  return {
    restUrl: `${supabaseUrl.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey,
  };
}

function headers() {
  const { serviceRoleKey } = getConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
}

async function restFetch<T>(path: string, init?: RequestInit) {
  const { restUrl } = getConfig();
  const response = await fetch(`${restUrl}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

export function toAuctionSessionUser(row: PublicAuctionUserRow): AuctionSessionUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    teamSname: row.team_sname,
    role: row.role,
  };
}

export async function readAuctionUserByUsername(username: string) {
  const rows = await restFetch<AuctionUserRow[]>(
    `/auction_users?select=*&username=eq.${encodeURIComponent(username)}&limit=1`,
  );

  return rows[0] ?? null;
}

export async function readPublicAuctionUser(userId: string) {
  const rows = await restFetch<PublicAuctionUserRow[]>(
    `/auction_users?select=id,username,display_name,team_sname,role,budget&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );

  return rows[0] ?? null;
}

export async function createExclusiveAuctionUserSession(userId: string) {
  const now = new Date();
  const nowIso = now.toISOString();
  const sessionSecret = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    now.getTime() + AUCTION_LOGIN_SESSION_MS,
  ).toISOString();

  await restFetch<null>(
    `/auction_user_sessions?user_id=eq.${encodeURIComponent(userId)}&revoked_at=is.null`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        revoked_at: nowIso,
        updated_at: nowIso,
      }),
    },
  );

  const rows = await restFetch<Array<{ id: string }>>(
    "/auction_user_sessions?select=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        session_token_hash: hashAuctionSessionSecret(sessionSecret),
        last_seen_at: nowIso,
        expires_at: expiresAt,
      }),
    },
  );

  const auctionSessionId = rows[0]?.id;

  if (!auctionSessionId) {
    throw new Error("Failed to create auction login session.");
  }

  return {
    auctionSessionId,
    auctionSessionSecret: sessionSecret,
  };
}

export async function readActiveAuctionUserFromRequest(request: NextRequest) {
  const token = readAuctionToken(request.cookies.get(AUCTION_COOKIE_NAME)?.value);

  if (!token) return null;

  const now = new Date();
  const rows = await restFetch<AuctionUserSessionRow[]>(
    `/auction_user_sessions?select=*&id=eq.${encodeURIComponent(token.auctionSessionId)}&user_id=eq.${encodeURIComponent(token.id)}&revoked_at=is.null&expires_at=gt.${encodeURIComponent(now.toISOString())}&limit=1`,
  );
  const activeSession = rows[0] ?? null;

  if (!activeSession) return null;

  if (
    activeSession.session_token_hash !==
    hashAuctionSessionSecret(token.auctionSessionSecret)
  ) {
    return null;
  }

  const user = await readPublicAuctionUser(token.id);

  if (!user) return null;

  const lastSeenAt = Date.parse(activeSession.last_seen_at);

  if (!Number.isFinite(lastSeenAt) || Date.now() - lastSeenAt > 30000) {
    await restFetch<null>(
      `/auction_user_sessions?id=eq.${encodeURIComponent(activeSession.id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      },
    );
  }

  return toAuctionSessionUser(user);
}

export async function revokeAuctionUserSessionFromRequest(request: NextRequest) {
  const token = readAuctionToken(request.cookies.get(AUCTION_COOKIE_NAME)?.value);

  if (!token) return;

  const nowIso = new Date().toISOString();

  await restFetch<null>(
    `/auction_user_sessions?id=eq.${encodeURIComponent(token.auctionSessionId)}&user_id=eq.${encodeURIComponent(token.id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        revoked_at: nowIso,
        updated_at: nowIso,
      }),
    },
  );
}

export async function upsertAuctionUsers(users: AuctionSetupUserInput[]) {
  const payload = users.map((user) => {
    const salt = `auction-${user.username}-${randomBytes(8).toString("hex")}`;

    return {
      username: user.username,
      password_salt: salt,
      password_hash: hashAuctionPassword(user.password, salt),
      display_name: user.displayName,
      team_sname: user.teamSname ?? null,
      role: user.role,
      budget: user.budget ?? (user.role === "bidder" ? 100000000 : 0),
      updated_at: new Date().toISOString(),
    };
  });

  await restFetch<null>("/auction_users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });
}

async function readSession() {
  const rows = await restFetch<AuctionSessionRow[]>(
    "/auction_sessions?select=*&order=created_at.asc&limit=1",
  );

  return rows[0] ?? null;
}

async function readAuctionPlayer(playerKey: string) {
  const rows = await restFetch<AuctionPlayerRow[]>(
    `/auction_players?select=*&player_key=eq.${encodeURIComponent(playerKey)}&limit=1`,
  );

  return rows[0] ?? null;
}

async function readPlayer(playerKey: string) {
  const rows = await restFetch<Fc26PlayerSearchResult[]>(
    `/${PLAYER_SOURCE_TABLE}?select=player_key,isSelected,name,canonical_name,overall_rating,position,nation,nation_image_url,avatar_url,card_image_url,card_image_public_url,pac,sho,pas,dri,def,phy&player_key=eq.${encodeURIComponent(playerKey)}&limit=1`,
  );

  return rows[0] ?? null;
}

async function readAuctionResults() {
  return restFetch<AuctionResultRow[]>(
    "/auction_results?select=player_key,winner_team_sname,final_price",
  );
}

async function readBids(playerKey: string) {
  return restFetch<AuctionBidRow[]>(
    `/auction_bids?select=*&player_key=eq.${encodeURIComponent(playerKey)}&order=amount.desc,created_at.asc`,
  );
}

function latestBidsByTeam(bids: AuctionBidRow[]) {
  const latest = new Map<string, AuctionBidRow>();

  for (const bid of [...bids].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  )) {
    if (!latest.has(bid.team_sname)) {
      latest.set(bid.team_sname, bid);
    }
  }

  return [...latest.values()].sort(
    (a, b) =>
      b.amount - a.amount ||
      Date.parse(a.created_at) - Date.parse(b.created_at),
  );
}

function effectiveBidsForSession(session: AuctionSessionRow | null, bids: AuctionBidRow[]) {
  return session?.mode === "sealed" ? latestBidsByTeam(bids) : bids;
}

function currentTieTeams(session: AuctionSessionRow | null) {
  return session?.tie_team_snames ?? [];
}

function resetTieState() {
  return {
    tie_round: 0,
    tie_team_snames: [],
  };
}

async function readTeamBudgetMap() {
  const teams = await restFetch<TeamBudgetRow[]>("/teams?select=sname,budget");

  return new Map(teams.map((team) => [team.sname, team.budget]));
}

export async function readAuctionState(currentUser: AuctionSessionUser | null) {
  const [users, session, playerCountRows, teamBudgetMap] = await Promise.all([
    restFetch<PublicAuctionUserRow[]>(
      "/auction_users?select=id,username,display_name,team_sname,role,budget&order=role.asc,display_name.asc",
    ),
    readSession(),
    restFetch<{ auction_order: number }[]>("/auction_players?select=auction_order"),
    readTeamBudgetMap(),
  ]);
  const playerKey = session?.current_player_key ?? null;
  const [auctionPlayer, player, bids] = playerKey
    ? await Promise.all([
        readAuctionPlayer(playerKey),
        readPlayer(playerKey),
        readBids(playerKey),
      ])
    : [null, null, [] as AuctionBidRow[]];
  const isAdmin = currentUser?.role === "admin";
  const canRevealSealed =
    isAdmin || session?.status === "revealing" || auctionPlayer?.status === "sold";
  const effectiveBids = effectiveBidsForSession(session, bids);
  const ownBid =
    bids
      .filter((bid) => bid.user_id === currentUser?.id)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] ??
    null;
  const displayBids =
    session?.mode === "sealed"
      ? [...bids].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      : bids;
  const visibleBids = displayBids.map((bid) => ({
    id: bid.id,
    user_id: bid.user_id,
    team_sname: bid.team_sname,
    amount: session?.mode === "sealed" && !canRevealSealed ? null : bid.amount,
    created_at: bid.created_at,
  }));

  return {
    currentUser,
    users: users.map((user) => ({
      ...user,
      budget: user.team_sname ? (teamBudgetMap.get(user.team_sname) ?? user.budget) : user.budget,
    })),
    session,
    auctionPlayer,
    player,
    bids: visibleBids,
    ownBid,
    highestBid: effectiveBids[0] ?? null,
    submittedBidCount: bids.length,
    totalPlayers: playerCountRows.length,
  } satisfies AuctionState;
}

export async function placeAuctionBid({
  amount,
  user,
}: {
  amount: number;
  user: AuctionSessionUser;
}) {
  if (!isAuctionBidder(user.role) || !user.teamSname) {
    throw new Error("Only bidders can place bids.");
  }

  const [session, publicUser, teamBudget] = await Promise.all([
    readSession(),
    readPublicAuctionUser(user.id),
    readTeamBudget(user.teamSname),
  ]);

  if (!session?.current_player_key || session.status !== "running") {
    throw new Error("Auction is not running.");
  }

  if (!publicUser || amount > teamBudget) {
    throw new Error("Bid exceeds budget.");
  }

  const bids = await readBids(session.current_player_key);

  if (session.mode === "public") {
    const highest = bids[0]?.amount ?? 0;

    if (amount <= highest) {
      throw new Error("Bid must be higher than current highest bid.");
    }

    await restFetch<null>("/auction_bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        session_id: session.id,
        player_key: session.current_player_key,
        user_id: user.id,
        team_sname: user.teamSname,
        amount,
        mode: session.mode,
      }),
    });

    return;
  }

  const tieTeams = currentTieTeams(session);

  if (tieTeams.length > 1 && !tieTeams.includes(user.teamSname)) {
    throw new Error("Only tied bidders can bid in extra sealed round.");
  }

  const previousBid =
    bids
      .filter((bid) => bid.team_sname === user.teamSname)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] ??
    null;

  if (previousBid && amount <= previousBid.amount) {
    throw new Error("Bid must be higher than your previous bid.");
  }

  await restFetch<null>("/auction_bids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      session_id: session.id,
      player_key: session.current_player_key,
      user_id: user.id,
      team_sname: user.teamSname,
      amount,
      mode: session.mode,
    }),
  });
}

export async function runAuctionAdminAction({
  action,
  mode,
  user,
}: {
  action: "start" | "reveal" | "finish" | "next";
  mode?: AuctionMode;
  user: AuctionSessionUser;
}) {
  if (user.role !== "admin") {
    throw new Error("Admin only.");
  }

  const session = await readSession();

  if (!session?.current_player_key || !session.current_order) {
    throw new Error("No auction session.");
  }

  if (action === "start") {
    if (session.status !== "idle") {
      throw new Error("Current auction already started.");
    }

    const nextMode = mode ?? session.mode;

    await Promise.all([
      restFetch<null>(
        `/auction_sessions?id=eq.${encodeURIComponent(session.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            mode: nextMode,
            status: "running",
            started_at: new Date().toISOString(),
            ...resetTieState(),
            updated_at: new Date().toISOString(),
          }),
        },
      ),
      restFetch<null>(
        `/auction_players?auction_order=eq.${session.current_order}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "active",
            auction_mode: nextMode,
            updated_at: new Date().toISOString(),
          }),
        },
      ),
    ]);

    return;
  }

  if (action === "reveal") {
    if (session.status !== "running") {
      throw new Error("Auction is not running.");
    }

    if (session.mode === "public") {
      throw new Error("Reveal is only available for sealed auctions.");
    }

    const bids = await readBids(session.current_player_key);
    const effectiveBids = effectiveBidsForSession(session, bids);

    if (effectiveBids.length === 0) {
      throw new Error("No bids to reveal.");
    }

    const tieTeams = currentTieTeams(session);
    const contenders =
      tieTeams.length > 1
        ? effectiveBids.filter((bid) => tieTeams.includes(bid.team_sname))
        : effectiveBids;
    const highestAmount = contenders[0]?.amount ?? null;
    const highestTeams =
      highestAmount == null
        ? []
        : contenders
            .filter((bid) => bid.amount === highestAmount)
            .map((bid) => bid.team_sname);

    if (highestTeams.length > 1) {
      await restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "running",
          tie_round: (session.tie_round ?? 0) + 1,
          tie_team_snames: highestTeams,
          updated_at: new Date().toISOString(),
        }),
      });

      return;
    }

    await restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "revealing",
        ...resetTieState(),
        updated_at: new Date().toISOString(),
      }),
    });

    return;
  }

  if (action === "finish") {
    if (session.status !== "running" && session.status !== "revealing") {
      throw new Error("Auction is not running.");
    }

    if (session.mode === "sealed" && session.status !== "revealing") {
      throw new Error("Please reveal sealed bids first.");
    }

    const bids = effectiveBidsForSession(
      session,
      await readBids(session.current_player_key),
    );

    if (bids.length === 0) {
      throw new Error("No bids to finish.");
    }

    await finishCurrentAuction(session);
    return;
  }

  if (session.status !== "finished") {
    const bids = await readBids(session.current_player_key);

    if (bids.length === 0) {
      await finishCurrentAuction(session);
      return;
    }

    throw new Error("Please finish current auction first.");
  }

  await moveToNextAuctionPlayer(session);
}

async function finishCurrentAuction(session: AuctionSessionRow) {
  if (!session.current_player_key || !session.current_order) {
    return;
  }

  const [highestBid, player] = await Promise.all([
    readBids(session.current_player_key).then(
      (bids) => effectiveBidsForSession(session, bids)[0] ?? null,
    ),
    readPlayer(session.current_player_key),
  ]);

  if (!highestBid || !player) {
    const updatedAt = new Date().toISOString();

    await Promise.all([
      restFetch<null>(
        `/auction_players?auction_order=eq.${session.current_order}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "unsold",
            updated_at: updatedAt,
          }),
        },
      ),
      restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "finished",
          ...resetTieState(),
          updated_at: updatedAt,
        }),
      }),
    ]);
    return;
  }

  await addPlayerToTeam({
    teamSname: highestBid.team_sname,
    player,
    transactionPrice: highestBid.amount,
  });

  const updatedAt = new Date().toISOString();

  await Promise.all([
    restFetch<null>(`/auction_results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        player_key: session.current_player_key,
        winner_user_id: highestBid.user_id,
        winner_team_sname: highestBid.team_sname,
        final_price: highestBid.amount,
        mode: session.mode,
      }),
    }),
    restFetch<null>(
      `/auction_players?auction_order=eq.${session.current_order}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "sold",
          sold_to_user_id: highestBid.user_id,
          sold_to_team_sname: highestBid.team_sname,
          sold_price: highestBid.amount,
          updated_at: updatedAt,
        }),
      },
    ),
    restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "finished",
        ...resetTieState(),
        updated_at: updatedAt,
      }),
    }),
  ]);
}

async function moveToNextAuctionPlayer(session: AuctionSessionRow) {
  const rows = await restFetch<AuctionPlayerRow[]>(
    `/auction_players?select=*&auction_order=gt.${session.current_order ?? 0}&status=eq.pending&order=auction_order.asc&limit=1`,
  );
  const next = rows[0];

  if (!next) {
    await restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "finished",
        updated_at: new Date().toISOString(),
      }),
    });
    return;
  }

  await restFetch<null>(`/auction_sessions?id=eq.${encodeURIComponent(session.id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      current_order: next.auction_order,
      current_player_key: next.player_key,
      mode: "public",
      status: "idle",
      started_at: null,
      ends_at: null,
      ...resetTieState(),
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function resetAuctionData(user: AuctionSessionUser) {
  if (user.role !== "admin") {
    throw new Error("Admin only.");
  }

  const [results, firstPlayers, sessions] = await Promise.all([
    readAuctionResults(),
    restFetch<Array<Pick<AuctionPlayerRow, "auction_order" | "player_key">>>(
      "/auction_players?select=auction_order,player_key&order=auction_order.asc&limit=1",
    ),
    restFetch<Array<Pick<AuctionSessionRow, "id">>>(
      "/auction_sessions?select=id&order=created_at.asc&limit=1",
    ),
  ]);
  const refundByTeam = new Map<string, number>();

  await Promise.all(
    results.map(async (result) => {
      if (!result.winner_team_sname) return;

      refundByTeam.set(
        result.winner_team_sname,
        (refundByTeam.get(result.winner_team_sname) ?? 0) +
          (result.final_price ?? 0),
      );

      await Promise.all([
        restFetch<null>(
          `/${encodeURIComponent(result.winner_team_sname)}?player_key=eq.${encodeURIComponent(result.player_key)}`,
          {
            method: "DELETE",
            headers: { Prefer: "return=minimal" },
          },
        ),
        restFetch<null>(
          `/selectedPlayer?player_key=eq.${encodeURIComponent(result.player_key)}`,
          {
            method: "DELETE",
            headers: { Prefer: "return=minimal" },
          },
        ),
        restFetch<null>(
          `/${PLAYER_SOURCE_TABLE}?player_key=eq.${encodeURIComponent(result.player_key)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ isSelected: false }),
          },
        ),
      ]);
    }),
  );

  await Promise.all(
    Array.from(refundByTeam.entries()).map(async ([teamSname, refund]) => {
      const currentBudget = await readTeamBudget(teamSname);

      await restFetch<null>(
        `/teams?sname=eq.${encodeURIComponent(teamSname)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            budget: Math.min(DEFAULT_AUCTION_BUDGET, currentBudget + refund),
          }),
        },
      );
    }),
  );

  const firstPlayer = firstPlayers[0] ?? null;
  const session = sessions[0] ?? null;
  const updatedAt = new Date().toISOString();

  await Promise.all([
    restFetch<null>("/auction_bids?id=not.is.null", {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }),
    restFetch<null>("/auction_results?player_key=not.is.null", {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }),
    restFetch<null>("/auction_players?auction_order=not.is.null", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "pending",
        sold_to_user_id: null,
        sold_to_team_sname: null,
        sold_price: null,
        auction_mode: "public",
        updated_at: updatedAt,
      }),
    }),
  ]);

  if (!firstPlayer) return;

  const sessionPayload = {
    current_order: firstPlayer.auction_order,
    current_player_key: firstPlayer.player_key,
    mode: "public",
    status: "idle",
    started_at: null,
    ends_at: null,
    ...resetTieState(),
    updated_at: updatedAt,
  };

  if (session) {
    await restFetch<null>(
      `/auction_sessions?id=eq.${encodeURIComponent(session.id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(sessionPayload),
      },
    );

    return;
  }

  await restFetch<null>("/auction_sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(sessionPayload),
  });
}
