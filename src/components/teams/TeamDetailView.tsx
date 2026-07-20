"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { TeamPlayerRow } from "@/lib/supabaseRest";
import type { Team } from "@/types";

interface TeamDetailViewProps {
  budget: number;
  canManage: boolean;
  players: TeamPlayerRow[];
  team: Team;
  teamSlug: string;
}

function formatBudgetMillions(value: number) {
  const millions = value / 1000000;
  return Number.isInteger(millions)
    ? `${millions}M`
    : `${millions.toFixed(1)}M`;
}

function formatPrice(value: number) {
  if (value > 0 && value < 1000000) {
    return `${value}M`;
  }

  const millions = value / 1000000;
  return Number.isInteger(millions)
    ? `${millions}M`
    : `${millions.toFixed(1)}M`;
}

export default function TeamDetailView({
  budget,
  canManage,
  players,
  team,
  teamSlug,
}: TeamDetailViewProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draftBudget, setDraftBudget] = useState(String(budget / 1000000));
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [removeAllError, setRemoveAllError] = useState("");

  useEffect(() => {
    if (!panelRef.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 96 },
        { autoAlpha: 1, y: 0, duration: 0.82, ease: "power3.out" },
      );
    }, panelRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const refreshIfCurrentTeam = (data: unknown) => {
      if (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        "teamSname" in data &&
        data.type === "team-player-added" &&
        data.teamSname === teamSlug
      ) {
        router.refresh();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        refreshIfCurrentTeam(event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    if (!("BroadcastChannel" in window)) {
      return () => window.removeEventListener("message", handleMessage);
    }

    const channel = new BroadcastChannel("team-player-events");
    channel.onmessage = (event) => refreshIfCurrentTeam(event.data);

    return () => {
      window.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [router, teamSlug]);

  const editBudget = () => {
    setDraftBudget(String(budget / 1000000));
    setBudgetError("");
    setIsEditingBudget(true);
  };

  const confirmBudget = async () => {
    if (isSavingBudget) return;

    const nextBudgetMillions = Number(draftBudget);

    if (!Number.isFinite(nextBudgetMillions) || nextBudgetMillions < 0) {
      setBudgetError("Invalid budget.");
      return;
    }

    setBudgetError("");
    setIsSavingBudget(true);

    const response = await fetch("/api/team-budget", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budget: Math.round(nextBudgetMillions * 1000000),
        teamSname: teamSlug,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setBudgetError(data?.error ?? "Failed to update budget.");
      setIsSavingBudget(false);
      return;
    }

    setIsEditingBudget(false);
    setIsSavingBudget(false);
    router.refresh();
  };

  const openAddPlayer = () => {
    window.open(
      `/teams/${encodeURIComponent(teamSlug)}/add-player`,
      "_blank",
      "noopener,noreferrer,width=980,height=720",
    );
  };

  const removeAllPlayers = async () => {
    if (isRemovingAll || players.length === 0) return;

    setIsRemovingAll(true);
    setRemoveAllError("");

    const response = await fetch("/api/team-player", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        removeAll: true,
        teamSname: teamSlug,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setRemoveAllError(data?.error ?? "Failed to remove all players.");
      setIsRemovingAll(false);
      return;
    }

    router.refresh();
    setIsRemovingAll(false);
  };

  return (
    <div className="team-detail-shell" ref={panelRef}>
      <Link href="/teams" className="team-detail-navButton">
        <span>返回阵容</span>
        <span>Back to Teams</span>
      </Link>
      <Link
        href={`/teams/${encodeURIComponent(teamSlug)}/settings`}
        className="team-detail-navButton team-detail-settingsButton"
      >
        <span>{"\u7403\u961f\u8bbe\u7f6e"}</span>
        <span>Team Settings</span>
      </Link>

      <div className="team-detail-summary">
        <div className="team-detail-panel">
          <div className="team-detail-logoWrap">
            <img src={team.img} alt={team.name} />
          </div>
          <h2 className="team-detail-name">{team.name}</h2>
        </div>

        <div className="team-budget-row">
          <div
            className="team-budget-table"
            role="table"
            aria-label={`${team.name} budget`}
          >
            <div className="team-budget-label" role="cell">
              <span>预算</span>
              <span>Budget</span>
            </div>
            <div className="team-budget-value" role="cell">
              {isEditingBudget ? (
                <label className="team-budget-inputWrap">
                  <input
                    aria-label="Budget in millions"
                    disabled={isSavingBudget}
                    inputMode="decimal"
                    onChange={(event) => setDraftBudget(event.target.value)}
                    type="number"
                    value={draftBudget}
                  />
                  <span>M</span>
                </label>
              ) : (
                <span>{formatBudgetMillions(budget)}</span>
              )}
            </div>
          </div>
          {canManage && isEditingBudget && (
            <button
              className="team-budget-button team-budget-button-confirm"
              disabled={isSavingBudget}
              onClick={confirmBudget}
              type="button"
            >
              <span>确认</span>
              <span>{isSavingBudget ? "Saving..." : "Confirm"}</span>
            </button>
          )}
        </div>
      </div>

      {canManage ? (
      <div className="team-budget-card">
        <div className="team-budget-actions">
          <button
            className="team-budget-button"
            onClick={editBudget}
            type="button"
          >
            <span>编辑预算</span>
            <span>Edit Budget</span>
          </button>
          <button
            className="team-budget-button"
            onClick={openAddPlayer}
            type="button"
          >
            <span>添加球员</span>
            <span>Add Player</span>
          </button>
          <button
            className="team-budget-button team-budget-button-danger"
            disabled={isRemovingAll || players.length === 0}
            onClick={removeAllPlayers}
            type="button"
          >
            <span>一键移除</span>
            <span>{isRemovingAll ? "Removing..." : "Remove All Players"}</span>
          </button>
        </div>
        {(budgetError || removeAllError) && (
          <div className="team-budget-error">
            {budgetError || removeAllError}
          </div>
        )}
      </div>
      ) : null}

      <TeamPlayersTable
        canManage={canManage}
        players={players}
        teamSlug={teamSlug}
      />
    </div>
  );
}

function TeamPlayersTable({
  canManage,
  players,
  teamSlug,
}: {
  canManage: boolean;
  players: TeamPlayerRow[];
  teamSlug: string;
}) {
  const router = useRouter();
  const [pendingPlayerKey, setPendingPlayerKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (players.length === 0) {
    return null;
  }

  const removePlayer = async (playerKey: string) => {
    if (pendingPlayerKey) return;

    setPendingPlayerKey(playerKey);
    setErrorMessage("");

    const response = await fetch("/api/team-player", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamSname: teamSlug,
        playerKey,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setErrorMessage(data?.error ?? "Failed to remove player.");
      setPendingPlayerKey("");
      return;
    }

    router.refresh();
    setPendingPlayerKey("");
  };

  return (
    <div className="team-roster-table">
      <div className={`team-roster-head${canManage ? "" : " is-readonly"}`}>
        <span>No</span>
        <span>Player</span>
        <span>OVR</span>
        <span>POS</span>
        <span>PAC</span>
        <span>SHO</span>
        <span>PAS</span>
        <span>DRI</span>
        <span>DEF</span>
        <span>PHY</span>
        <span>Price</span>
        {canManage ? <span>Action</span> : null}
      </div>
      {players.map((player, index) => (
        <div
          className={`team-roster-row${canManage ? "" : " is-readonly"}`}
          key={player.player_key}
        >
          <span className="team-roster-no">{index + 1}</span>
          <div className="team-roster-player">
            {player.avatar_url && (
              <img src={player.avatar_url} alt={player.name} />
            )}
            <span>{player.name}</span>
          </div>
          <span>{player.overall_rating}</span>
          <span>{player.position}</span>
          <span>{player.pac}</span>
          <span>{player.sho}</span>
          <span>{player.pas}</span>
          <span>{player.dri}</span>
          <span>{player.def}</span>
          <span>{player.phy}</span>
          <span>{formatPrice(player.transaction_price)}</span>
          {canManage ? (
          <button
            className="team-roster-removeButton"
            disabled={Boolean(pendingPlayerKey)}
            onClick={() => removePlayer(player.player_key)}
            type="button"
          >
            <span>移除球员</span>
            <span>Remove Player</span>
          </button>
          ) : null}
        </div>
      ))}
      {errorMessage && <div className="team-roster-error">{errorMessage}</div>}
    </div>
  );
}
