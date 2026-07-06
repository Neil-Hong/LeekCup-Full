"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Team } from "@/types";

interface TeamDetailViewProps {
  team: Team;
  teamId: number;
}

export default function TeamDetailView({ team, teamId }: TeamDetailViewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [budget, setBudget] = useState(100);
  const [draftBudget, setDraftBudget] = useState("100");
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
    if (!panelRef.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 36, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out" },
      );
    }, panelRef);

    return () => context.revert();
  }, []);

  const editBudget = () => {
    setDraftBudget(String(budget));
    setIsEditingBudget(true);
  };

  const confirmBudget = () => {
    const nextBudget = Number(draftBudget);
    if (Number.isFinite(nextBudget)) {
      setBudget(nextBudget);
    }
    setIsEditingBudget(false);
  };

  const openAddPlayer = () => {
    window.open(
      `/teams/${teamId}/add-player`,
      "_blank",
      "noopener,noreferrer,width=720,height=520",
    );
  };

  return (
    <div className="team-detail-shell" ref={panelRef}>
      <Link href="/teams" className="team-detail-navButton">
        Back to Teams
      </Link>

      <div className="team-detail-panel">
        <div className="team-detail-logoWrap">
          <img src={team.img} alt={team.name} />
        </div>
        <h2 className="team-detail-name">{team.name}</h2>
      </div>

      <div className="team-budget-card">
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
                    inputMode="decimal"
                    onChange={(event) => setDraftBudget(event.target.value)}
                    type="number"
                    value={draftBudget}
                  />
                  <span>M</span>
                </label>
              ) : (
                <span>{budget}M</span>
              )}
            </div>
          </div>
          {isEditingBudget && (
            <button
              className="team-budget-button team-budget-button-confirm"
              onClick={confirmBudget}
              type="button"
            >
              <span>确认</span>
              <span>Confirm</span>
            </button>
          )}
        </div>

        <div className="team-budget-actions">
          <button className="team-budget-button" onClick={editBudget} type="button">
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
        </div>
      </div>
    </div>
  );
}
