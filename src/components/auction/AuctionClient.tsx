"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TEAMS2 } from "@/data/teams2";

interface AuctionUser {
  id: string;
  username: string;
  display_name: string;
  team_sname: string | null;
  role: "admin" | "bidder";
  budget: number;
}

interface AuctionBid {
  id: string;
  user_id: string;
  team_sname: string;
  amount: number | null;
  created_at: string;
}

interface AuctionState {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    teamSname: string | null;
    role: "admin" | "bidder";
  } | null;
  users: AuctionUser[];
  session: {
    id: string;
    current_order: number | null;
    current_player_key: string | null;
    mode: "public" | "sealed";
    status: "idle" | "running" | "revealing" | "finished";
  } | null;
  auctionPlayer: {
    auction_order: number;
    status: "pending" | "active" | "sold" | "unsold";
    sold_to_team_sname: string | null;
    sold_price: number | null;
    auction_mode: "public" | "sealed";
  } | null;
  player: {
    name: string;
    overall_rating: number;
    position: string;
    nation: string;
    nation_image_url: string | null;
    avatar_url: string | null;
    card_image_url: string | null;
    card_image_public_url: string | null;
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    phy: number;
  } | null;
  bids: AuctionBid[];
  ownBid: AuctionBid | null;
  highestBid: AuctionBid | null;
  submittedBidCount: number;
  totalPlayers: number;
}

type Flash =
  | { kind: "start"; zh: string; en: string }
  | { kind: "deal"; zh: string; en: string }
  | { kind: "message"; zh: string; en: string };

const emptyState: AuctionState = {
  currentUser: null,
  users: [],
  session: null,
  auctionPlayer: null,
  player: null,
  bids: [],
  ownBid: null,
  highestBid: null,
  submittedBidCount: 0,
  totalPlayers: 0,
};

const modeLabel = {
  public: { zh: "\u660e\u62cd", en: "Public" },
  sealed: { zh: "\u6697\u62cd", en: "Sealed" },
} as const;

const statusLabel = {
  idle: { zh: "\u5f85\u5f00\u59cb", en: "Idle" },
  running: { zh: "\u7ade\u62cd\u4e2d", en: "Running" },
  revealing: { zh: "\u63ed\u793a\u4e2d", en: "Revealing" },
  finished: { zh: "\u7ade\u62cd\u7ed3\u675f", en: "Finished" },
} as const;

const teamBySname = Object.fromEntries(
  Object.values(TEAMS2).map((team) => [team.sname, team]),
);

function formatMoney(value: number | null | undefined) {
  if (value == null) return "Hidden";
  return `${(value / 1000000).toFixed(1)}M`;
}

function translateAuctionMessage(message: string) {
  if (message.includes("Bid must be higher")) {
    return "\u51fa\u4ef7\u5fc5\u987b\u9ad8\u4e8e\u5f53\u524d\u6700\u9ad8\u4ef7";
  }

  if (message.includes("Bid exceeds budget")) {
    return "\u51fa\u4ef7\u8d85\u8fc7\u9884\u7b97";
  }

  if (message.includes("Auction is not running")) {
    return "\u7ade\u62cd\u5c1a\u672a\u5f00\u59cb";
  }

  if (message.includes("Only bidders")) {
    return "\u53ea\u6709\u7ade\u62cd\u8005\u53ef\u4ee5\u51fa\u4ef7";
  }

  if (message.includes("Invalid bid amount")) {
    return "\u51fa\u4ef7\u91d1\u989d\u65e0\u6548";
  }

  if (message.includes("Admin only")) {
    return "\u4ec5\u7ba1\u7406\u5458\u53ef\u64cd\u4f5c";
  }

  if (message.includes("Login failed")) {
    return "\u767b\u5f55\u5931\u8d25";
  }

  return "\u64cd\u4f5c\u5931\u8d25";
}

function numericUsernameOrder(username: string) {
  const value = Number(username.replace(/\D/g, ""));
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function BilingualLabel({
  zh,
  en,
  className,
  children,
}: {
  zh: string;
  en: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={className}>
      <span>{zh}</span>
      <span>
        {children}
        {en}
      </span>
    </span>
  );
}

export default function AuctionClient() {
  const [state, setState] = useState<AuctionState>(emptyState);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [adminMode, setAdminMode] = useState<"public" | "sealed">("public");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [actionFlash, setActionFlash] = useState<Flash | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const lastAuctionSignalRef = useRef<string | null>(null);

  const loadState = useCallback(async () => {
    const response = await fetch("/api/auction/state", { cache: "no-store" });
    const data = (await response.json()) as AuctionState | { error?: string };

    if (!response.ok) {
      setMessage(
        "\u52a0\u8f7d\u7ade\u62cd\u72b6\u6001\u5931\u8d25 Failed to load auction state.",
      );
      return;
    }

    setState(data as AuctionState);
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(loadState, 0);
    const timer = window.setInterval(loadState, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [loadState]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
    },
    [],
  );

  const triggerActionFlash = useCallback((flash: Flash, duration = 1200) => {
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }

    setActionFlash(flash);
    flashTimerRef.current = window.setTimeout(() => {
      setActionFlash(null);
      flashTimerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    const session = state.session;

    if (!session?.current_player_key) {
      lastAuctionSignalRef.current = null;
      return;
    }

    const playerStatus = state.auctionPlayer?.status ?? "pending";
    const signal = `${session.current_player_key}:${session.status}:${playerStatus}`;
    const previousSignal = lastAuctionSignalRef.current;

    if (!previousSignal) {
      lastAuctionSignalRef.current = signal;
      return;
    }

    if (previousSignal === signal) {
      return;
    }

    lastAuctionSignalRef.current = signal;

    if (!previousSignal.startsWith(`${session.current_player_key}:`)) {
      return;
    }

    const queueFlash = (flash: Flash, duration?: number) => {
      window.setTimeout(() => triggerActionFlash(flash, duration), 0);
    };

    if (session.status === "running") {
      queueFlash(
        { kind: "start", zh: "\u5f00\u59cb\u7ade\u62cd", en: "Running" },
        3600,
      );
      return;
    }

    if (session.status === "revealing") {
      queueFlash({ kind: "message", zh: "\u63ed\u793a", en: "Reveal" });
      return;
    }

    if (
      session.status === "finished" ||
      playerStatus === "sold" ||
      playerStatus === "unsold"
    ) {
      queueFlash({ kind: "deal", zh: "\u6210\u4ea4", en: "Deal" }, 1600);
    }
  }, [state.auctionPlayer?.status, state.session, triggerActionFlash]);

  const currentCardImage = useMemo(() => {
    const player = state.player;
    return (
      player?.card_image_url ??
      player?.card_image_public_url ??
      player?.avatar_url
    );
  }, [state.player]);

  const bidderUsers = useMemo(
    () =>
      state.users
        .filter((user) => user.role === "bidder")
        .sort(
          (a, b) =>
            numericUsernameOrder(a.username) - numericUsernameOrder(b.username),
        ),
    [state.users],
  );

  const isAdmin = state.currentUser?.role === "admin";
  const sealedHidden =
    state.session?.mode === "sealed" &&
    state.session.status !== "revealing" &&
    !isAdmin;
  const mode = state.session?.mode ?? "public";
  const status = state.session?.status ?? "idle";
  const displayStatus =
    state.auctionPlayer?.status === "sold" ||
    state.auctionPlayer?.status === "unsold"
      ? "finished"
      : status;

  const login = async () => {
    setIsBusy(true);
    setMessage("");
    const response = await fetch("/api/auction/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setIsBusy(false);

    if (!response.ok) {
      setMessage(data?.error ?? "鐧诲綍澶辫触 Login failed.");
      return;
    }

    setPassword("");
    await loadState();
  };

  const logout = async () => {
    await fetch("/api/auction/logout", { method: "POST" });
    await loadState();
  };

  const resetAuction = async () => {
    const confirmed = window.confirm(
      "\u786e\u8ba4\u91cd\u7f6e\u7ade\u62cd\u72b6\u6001\u548c\u8fc7\u7a0b\uff1f\u5df2\u6210\u4ea4\u7684\u7ade\u62cd\u7403\u5458\u4f1a\u4ece\u5bf9\u5e94\u7403\u961f\u79fb\u9664\uff0c\u5e76\u9000\u56de\u7ade\u62cd\u6210\u4ea4\u4ef7\u3002\nReset auction state and process?",
    );

    if (!confirmed) return;

    setIsBusy(true);
    setMessage("");

    const response = await fetch("/api/auction/reset", { method: "POST" });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setIsBusy(false);

    if (!response.ok) {
      setMessage(
        data?.error ??
          "\u91cd\u7f6e\u7ade\u62cd\u5931\u8d25 Reset auction failed.",
      );
      return;
    }

    triggerActionFlash({
      kind: "message",
      zh: "\u91cd\u7f6e\u7ade\u62cd",
      en: "Reset Auction",
    });
    await loadState();
  };

  const submitBid = async () => {
    setIsBusy(true);
    setMessage("");
    const response = await fetch("/api/auction/bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(bidAmount) * 1000000 }),
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setIsBusy(false);

    if (!response.ok) {
      setMessage(data?.error ?? "出价失败 Bid failed.");
      return;
    }

    triggerActionFlash({
      kind: "message",
      zh: "出价成功",
      en: "Bid Placed",
    });
    setBidAmount("");
    await loadState();
  };

  const adminAction = async (
    action: "start" | "reveal" | "finish" | "next",
  ) => {
    setIsBusy(true);
    setMessage("");
    const response = await fetch("/api/auction/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, mode: adminMode }),
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setIsBusy(false);

    if (!response.ok) {
      setMessage(
        data?.error ??
          "\u7ba1\u7406\u5458\u64cd\u4f5c\u5931\u8d25 Admin action failed.",
      );
      return;
    }

    if (action === "next") {
      triggerActionFlash({
        kind: "message",
        zh: "\u4e0b\u4e00\u4f4d",
        en: "Next Player",
      });
    }

    await loadState();
  };

  if (!state.currentUser) {
    return (
      <main className="auction-page groupstage-enterPage">
        <section className="auction-loginPanel">
          <h1>竞拍登录</h1>
          <span>Auction Login</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
          />
          <button disabled={isBusy} onClick={login} type="button">
            <span>登陆</span>
            <span>Login</span>
          </button>
          {message && <p>{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="auction-page groupstage-enterPage">
      <div className="auction-titleRow">
        <div>
          <h1>
            {
              "2026-2027\u8d5b\u5b63 84452\u97ed\u83dc\u676f\u7ade\u62cd\u7cfb\u7edf"
            }
          </h1>
          <h2>2026-2027 Season 84452 LEEK CUP AUCTION</h2>
        </div>
        <div className="auction-titleActions">
          {isAdmin && (
            <button
              className="auction-smallButton"
              disabled={isBusy}
              onClick={resetAuction}
              type="button"
            >
              <span>{"\u91cd\u7f6e\u7ade\u62cd"}</span>
              <span>Reset Auction</span>
            </button>
          )}
          <button
            className="auction-smallButton"
            onClick={logout}
            type="button"
          >
            <span>退出</span>
            <span>Logout</span>
          </button>
          <Link className="auction-smallButton" href="/entrance">
            <span>返回</span>
            <span>Back</span>
          </Link>
        </div>
      </div>

      <section className="auction-mainGrid">
        <div className="auction-playerCard">
          <div className="auction-playerMeta">
            <BilingualLabel
              zh={`#${state.session?.current_order ?? "-"} / ${state.totalPlayers}`}
              en="Players"
            />
            <BilingualLabel zh={modeLabel[mode].zh} en={modeLabel[mode].en} />
            <BilingualLabel
              className={displayStatus === "running" ? "is-running" : ""}
              zh={statusLabel[displayStatus].zh}
              en={statusLabel[displayStatus].en}
            >
              {displayStatus === "running" && (
                <i className="auction-liveDot" aria-hidden="true" />
              )}
            </BilingualLabel>
          </div>

          {actionFlash && <AuctionFlash flash={actionFlash} />}

          {state.player ? (
            <>
              {currentCardImage && (
                <img src={currentCardImage} alt={state.player.name} />
              )}
              <div className="auction-playerInfoDeck">
                <div className="auction-playerRatingLine">
                  <strong>
                    {state.player.overall_rating} {state.player.position}
                  </strong>
                  {state.player.nation_image_url && (
                    <img
                      className="auction-nation"
                      src={state.player.nation_image_url}
                      alt={state.player.nation}
                    />
                  )}
                </div>
                <h2>{state.player.name}</h2>
                <div className="auction-statGrid">
                  <Stat label="PAC" value={state.player.pac} />
                  <Stat label="SHO" value={state.player.sho} />
                  <Stat label="PAS" value={state.player.pas} />
                  <Stat label="DRI" value={state.player.dri} />
                  <Stat label="DEF" value={state.player.def} />
                  <Stat label="PHY" value={state.player.phy} />
                </div>
              </div>
            </>
          ) : (
            <h2>No Player</h2>
          )}
        </div>

        <div className="auction-bidHistory">
          <h3>
            <span>竞拍历史</span>
            <span>Bid History</span>
          </h3>
          {state.bids.length === 0 ? (
            <p>No bids yet.</p>
          ) : (
            state.bids.map((bid) => {
              const team = teamBySname[bid.team_sname];

              return (
                <div key={bid.id}>
                  <span className="auction-userIdentity">
                    {team && <img src={team.img} alt={team.name} />}
                    <span>{bid.team_sname}</span>
                  </span>
                  <strong>{formatMoney(bid.amount)}</strong>
                </div>
              );
            })
          )}
        </div>
      </section>

      {message && (
        <div className="auction-message">
          <span>{translateAuctionMessage(message)}</span>
          <span>{message}</span>
        </div>
      )}

      <section className="auction-bidBoard">
        <div className="auction-currentPrice">
          <h3>
            <span>{"\u5f53\u524d\u6700\u9ad8\u4ef7"}</span>
            <span>Current Highest</span>
          </h3>
          <strong>
            {sealedHidden
              ? "\u6697\u62cd\u9690\u85cf Hidden"
              : formatMoney(state.highestBid?.amount)}
          </strong>
          <span className="auction-currentBidder">
            <span>
              {sealedHidden
                ? `${state.submittedBidCount} \u6b21\u51fa\u4ef7`
                : state.highestBid?.team_sname
                  ? `\u7531 ${state.highestBid.team_sname} \u51fa\u4ef7`
                  : `${state.submittedBidCount} \u6b21\u51fa\u4ef7`}
            </span>
            <span>
              {sealedHidden
                ? "bids submitted"
                : state.highestBid?.team_sname
                  ? `by ${state.highestBid.team_sname}`
                  : "bids submitted"}
            </span>
          </span>
        </div>

        {!isAdmin && (
          <div
            className={`auction-bidForm ${actionFlash ? "is-flashing" : ""}`}
          >
            <input
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              placeholder="M"
              type="number"
            />
            <button
              disabled={isBusy || state.session?.status !== "running"}
              onClick={submitBid}
              type="button"
            >
              <span>出价</span>
              <span>Bid</span>
            </button>
            {state.ownBid && (
              <span className="auction-ownBid">
                <strong>我的出价 {formatMoney(state.ownBid.amount)}</strong>
                <span>My bid</span>
              </span>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="auction-adminPanel">
            <select
              value={adminMode}
              onChange={(event) =>
                setAdminMode(event.target.value as "public" | "sealed")
              }
            >
              <option value="public">{"\u660e\u62cd Public"}</option>
              <option value="sealed">{"\u6697\u62cd Sealed"}</option>
            </select>
            <button onClick={() => adminAction("start")} type="button">
              <span>{"\u5f00\u59cb"}</span>
              <span>Start</span>
            </button>
            <button onClick={() => adminAction("reveal")} type="button">
              <span>{"\u63ed\u793a"}</span>
              <span>Reveal</span>
            </button>
            <button onClick={() => adminAction("finish")} type="button">
              <span>{"\u6210\u4ea4"}</span>
              <span>Finish</span>
            </button>
            <button onClick={() => adminAction("next")} type="button">
              <span>{"\u4e0b\u4e00\u4f4d"}</span>
              <span>Next</span>
            </button>
          </div>
        )}
      </section>

      <section className="auction-dataGrid">
        <div className="auction-sidePanel">
          <h3>
            <span>{"\u7ade\u62cd\u8005"}</span>
            <span>Bidders</span>
          </h3>
          <div className="auction-userList">
            {bidderUsers.map((user) => {
              const team = user.team_sname
                ? teamBySname[user.team_sname]
                : null;

              return (
                <div className="auction-userRow" key={user.id}>
                  {team && <img src={team.img} alt={team.name} />}
                  <span>{user.display_name}</span>
                  <strong>{formatMoney(user.budget)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function AuctionFlash({ flash }: { flash: Flash }) {
  if (flash.kind === "start") {
    return (
      <div className="auction-actionFlash is-countdown">
        <span>3</span>
        <span>2</span>
        <span>1</span>
        <strong>
          <span>{flash.zh}</span>
          <span>{flash.en}</span>
        </strong>
      </div>
    );
  }

  return (
    <div
      className={`auction-actionFlash ${flash.kind === "deal" ? "is-deal" : ""}`}
    >
      <strong>
        <span>{flash.zh}</span>
        <span>{flash.en}</span>
      </strong>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
