"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Team } from "@/types";

interface TeamEntry extends Team {
  id: number;
}

interface TeamsDashboardProps {
  teams: TeamEntry[];
}

export default function TeamsDashboard({ teams }: TeamsDashboardProps) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedSname, setSelectedSname] = useState<string | null>(null);

  useEffect(() => {
    if (
      !gridRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const grid = gridRef.current;
    grid.classList.add("is-entering");

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".team-dashboard-card");
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      gsap.fromTo(
        cards,
        {
          autoAlpha: 0,
          scale: 0.92,
          x: (_, card) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            return centerX < viewportCenterX ? -120 : 120;
          },
          y: (_, card) => {
            const rect = card.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            return centerY < viewportCenterY ? -72 : 72;
          },
          rotation: (index) => (index % 2 === 0 ? -3 : 3),
        },
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.95,
          ease: "expo.out",
          stagger: { amount: 0.32, from: "center" },
          overwrite: "auto",
          onComplete: () => {
            gsap.set(cards, { clearProps: "transform,opacity,visibility" });
            requestAnimationFrame(() => grid.classList.remove("is-entering"));
          },
        },
      );
    }, gridRef);

    return () => {
      grid.classList.remove("is-entering");
      context.revert();
    };
  }, []);

  const openTeam = (team: TeamEntry) => {
    if (selectedSname !== null || !team.sname) return;

    const cards = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>(".team-dashboard-card") ??
        [],
    );
    const selectedCard = cards.find(
      (card) => card.dataset.teamSname === team.sname,
    );
    const teamPath = `/teams/${encodeURIComponent(team.sname)}`;

    setSelectedSname(team.sname);

    if (
      !selectedCard ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      router.push(teamPath);
      return;
    }

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => router.push(teamPath),
    });

    tl.to(selectedCard, {
      scale: 0.9,
      y: 8,
      duration: 0.16,
      ease: "power2.out",
      boxShadow: "inset 0 0 22px rgba(14, 190, 255, 0.7), 0 0 12px #0ebeff",
    })
      .to(selectedCard, {
        autoAlpha: 0,
        scale: 0.78,
        y: 18,
        duration: 0.48,
        ease: "power3.in",
        boxShadow: "inset 0 0 38px rgba(14, 190, 255, 0.3), 0 0 0 rgba(14, 190, 255, 0)",
      })
      .to(
        cards.filter((card) => card !== selectedCard),
        {
          autoAlpha: 0,
          scale: 0.72,
          duration: 0.72,
          rotation: (index) => (index % 2 === 0 ? -10 : 10),
          x: (_, card) => {
            const rect = (card as HTMLElement).getBoundingClientRect();
            return rect.left + rect.width / 2 < viewportCenterX
              ? -window.innerWidth
              : window.innerWidth;
          },
          y: (_, card) => {
            const rect = (card as HTMLElement).getBoundingClientRect();
            return rect.top + rect.height / 2 < viewportCenterY
              ? -window.innerHeight * 0.45
              : window.innerHeight * 0.45;
          },
          stagger: { amount: 0.18, from: "center" },
        },
        0.08,
      );
  };

  return (
    <div className="teams-dashboard-grid" ref={gridRef}>
      {teams.map((team) => (
        <div
          className={`team-dashboard-card ${selectedSname === team.sname ? "is-selected" : ""}`}
          data-team-id={team.id}
          data-team-sname={team.sname}
          key={team.id}
          onClick={() => openTeam(team)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openTeam(team);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="team-dashboard-logoWrap">
            <img src={team.img} alt={team.name} />
          </div>
          <div className="team-dashboard-name">{team.name}</div>
        </div>
      ))}
    </div>
  );
}
