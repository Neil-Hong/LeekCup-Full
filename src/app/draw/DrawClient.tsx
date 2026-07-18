"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import ReactAudioPlayer from "react-audio-player";
import { STAGE_1, STAGE_2 } from "@/data/teams";
import { TEAMS2 } from "@/data/teams2";
import type { Team } from "@/types";

interface TeamEntry extends Team {
  id: number;
}

interface DrawGroups {
  groupA: TeamEntry[];
  groupB: TeamEntry[];
}

interface DrawClientProps {
  canConfirmGroups: boolean;
}

interface StoredGroupTeam {
  team_id: number;
  name: string;
  sname: string;
  img: string;
}

interface ConfirmedGroupsResponse {
  groupAHasData?: boolean;
  groupBHasData?: boolean;
  hasConfirmedGroups?: boolean;
  groupA?: StoredGroupTeam[];
  groupB?: StoredGroupTeam[];
}

const TEAMS_IN_DRAW = Object.entries(TEAMS2).map(([id, team]) => ({
  ...team,
  id: Number(id),
}));

function shuffleTeams(teams: TeamEntry[]) {
  const shuffled = [...teams];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function toTeamEntries(teams: StoredGroupTeam[]) {
  return teams.map((team) => ({
    id: team.team_id,
    name: team.name,
    sname: team.sname,
    img: team.img,
  }));
}

export default function DrawClient({ canConfirmGroups }: DrawClientProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<DrawGroups | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [revealGroups, setRevealGroups] = useState(false);
  const [isConfirmingGroups, setIsConfirmingGroups] = useState(false);
  const [hasConfirmedGroups, setHasConfirmedGroups] = useState(false);
  const [hasSavedGroupData, setHasSavedGroupData] = useState(false);
  const [isLoadingSavedGroups, setIsLoadingSavedGroups] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkConfirmedGroups = async () => {
      try {
        const response = await fetch("/api/confirm-groups", {
          cache: "no-store",
        });

        if (!response.ok || !isMounted) {
          if (isMounted) {
            setIsLoadingSavedGroups(false);
          }
          return;
        }

        const data = (await response.json()) as ConfirmedGroupsResponse;

        const hasSavedGroups = Boolean(
          data.groupAHasData || data.groupBHasData,
        );

        setHasConfirmedGroups(Boolean(data.hasConfirmedGroups));
        setHasSavedGroupData(hasSavedGroups);

        if (hasSavedGroups) {
          setGroups({
            groupA: toTeamEntries(data.groupA ?? []),
            groupB: toTeamEntries(data.groupB ?? []),
          });
          setRevealGroups(true);
        }

        setIsLoadingSavedGroups(false);
      } catch {
        if (isMounted) {
          setIsLoadingSavedGroups(false);
        }
      }
    };

    void checkConfirmedGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
    };
  }, []);

  const finishVideo = () => {
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    setShowVideo(false);
    setRevealGroups(true);
  };

  const handleDraw = () => {
    if (canConfirmGroups && hasSavedGroupData) {
      return;
    }

    const shuffledTeams = shuffleTeams(TEAMS_IN_DRAW);

    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }

    setGroups({
      groupA: shuffledTeams.slice(0, 8),
      groupB: shuffledTeams.slice(8, 16),
    });
    setRevealGroups(false);
    setShowVideo(true);
    setIsConfirmingGroups(false);
    videoTimerRef.current = setTimeout(finishVideo, 6000);
  };

  const confirmGroups = async () => {
    if (
      !groups ||
      !revealGroups ||
      isConfirmingGroups ||
      hasConfirmedGroups ||
      hasSavedGroupData
    ) {
      return;
    }

    setIsConfirmingGroups(true);
    setIsConfirmDialogOpen(false);

    const response = await fetch("/api/confirm-groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupA: groups.groupA.map((team, index) => ({
          position_order: index + 1,
          team_id: team.id,
          name: team.name,
          sname: team.sname ?? "",
          img: team.img,
        })),
        groupB: groups.groupB.map((team, index) => ({
          position_order: index + 1,
          team_id: team.id,
          name: team.name,
          sname: team.sname ?? "",
          img: team.img,
        })),
      }),
    });

    if (!response.ok) {
      setIsConfirmingGroups(false);

      if (response.status === 409) {
        setHasSavedGroupData(true);
      }

      return;
    }

    setHasConfirmedGroups(true);
    router.push("/groupstage");
  };

  const requestGroupConfirmation = () => {
    if (
      !groups ||
      !revealGroups ||
      isConfirmingGroups ||
      hasConfirmedGroups ||
      hasSavedGroupData
    ) {
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="drawPageContainer groupstage-enterPage text-center">
      <BackButton />
      <ReactAudioPlayer src="/audio/theme.mp3" autoPlay loop volume={0.3} />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY
      </h2>
      <div className="title">
        <h1 className="text-2xl sm:text-3xl text-white font-bold">
          参赛队伍巡礼
        </h1>
        <h2 className="text-lg sm:text-xl text-white">Clubs in the draw</h2>
      </div>

      <RenderStage images={STAGE_1} />
      <RenderStage images={STAGE_2} />

      <img src="/images/draw.png" className="drawImage" alt="drawScene" />

      <div className="flex flex-row flex-wrap justify-center gap-4 my-4">
        <button
          className="drawButton"
          disabled={canConfirmGroups && (hasSavedGroupData || isLoadingSavedGroups)}
          onClick={handleDraw}
        >
          抽签
          <br />
          Draw
        </button>
        {canConfirmGroups ? (
          <button
            className="drawButton"
            disabled={
              !groups ||
              !revealGroups ||
              isConfirmingGroups ||
              hasConfirmedGroups ||
              hasSavedGroupData
            }
            onClick={requestGroupConfirmation}
          >
            确认分组
            <br />
            Confirm Group
          </button>
        ) : null}
      </div>

      {showVideo && <DrawVideoOverlay onEnded={finishVideo} />}
      {isConfirmDialogOpen && (
        <ConfirmGroupsDialog
          isConfirming={isConfirmingGroups}
          onCancel={() => setIsConfirmDialogOpen(false)}
          onConfirm={confirmGroups}
        />
      )}

      <div className="draw-groups">
        <DrawGroup
          title="A组"
          subtitle="Group A"
          teams={groups?.groupA ?? []}
          reveal={revealGroups}
        />
        <DrawGroup
          title="B组"
          subtitle="Group B"
          teams={groups?.groupB ?? []}
          reveal={revealGroups}
        />
      </div>

      <div className="h-[150px]" />
    </div>
  );
}

function ConfirmGroupsDialog({
  isConfirming,
  onCancel,
  onConfirm,
}: {
  isConfirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const actionButtonStyle = {
    minWidth: 116,
    padding: "10px 18px",
    color: "#ffffff",
    cursor: isConfirming ? "not-allowed" : "pointer",
    background: "#02070d",
    border: "1px solid #0ebeff",
    borderRadius: 6,
    font: "inherit",
    opacity: isConfirming ? 0.58 : 1,
  } as const;

  return createPortal(
    <div
      className="draw-confirm-overlay"
      role="presentation"
      style={{
        position: "fixed",
        zIndex: 10000,
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: 24,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(6px)",
      }}
    >
      <section
        aria-labelledby="draw-confirm-title"
        aria-modal="true"
        className="draw-confirm-dialog"
        role="dialog"
        style={{
          width: "min(470px, 100%)",
          boxSizing: "border-box",
          padding: 32,
          color: "#ffffff",
          textAlign: "center",
          background: "rgba(1, 10, 24, 0.98)",
          border: "1px solid #0ebeff",
          borderRadius: 8,
          boxShadow: "0 0 24px rgba(14, 190, 255, 0.72)",
        }}
      >
        <h3 id="draw-confirm-title">确认分组</h3>
        <p>确认抽签分组后无法更改，是否确认？</p>
        <p>Once the draw groups are confirmed, they cannot be changed. Proceed?</p>
        <div
          className="draw-confirm-actions"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 26,
          }}
        >
          <button
            disabled={isConfirming}
            onClick={onCancel}
            style={actionButtonStyle}
            type="button"
          >
            <span>否</span>
            <span>No</span>
          </button>
          <button
            disabled={isConfirming}
            onClick={onConfirm}
            style={actionButtonStyle}
            type="button"
          >
            <span>{isConfirming ? "确认中" : "是"}</span>
            <span>{isConfirming ? "Confirming" : "Yes"}</span>
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function DrawVideoOverlay({ onEnded }: { onEnded: () => void }) {
  return createPortal(
    <div className="videoOverlay">
      <video
        controls={false}
        autoPlay
        muted
        className="overlayVideo"
        onEnded={onEnded}
      >
        <source src="/video/drawVideo.mp4" type="video/mp4" />
      </video>
    </div>,
    document.body,
  );
}

function BackButton() {
  return (
    <Link
      href="/entrance"
      className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20"
    >
      返回
      <br />
      Back
    </Link>
  );
}

function DrawGroup({
  title,
  subtitle,
  teams,
  reveal,
}: {
  title: string;
  subtitle: string;
  teams: TeamEntry[];
  reveal: boolean;
}) {
  return (
    <section className="draw-group-panel">
      <div className="draw-group-title">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>
      <div className="draw-group-grid">
        {teams.length > 0
          ? teams.map((team, index) => (
              <div
                className={`draw-group-team ${reveal ? "is-revealing" : "is-hidden"}`}
                key={team.id}
                style={{ animationDelay: `${index * 0.22}s` }}
              >
                <img src={team.img} alt={team.name} />
                <span>{team.name}</span>
              </div>
            ))
          : Array.from({ length: 8 }, (_, index) => (
              <div className="draw-group-team is-empty" key={index} />
            ))}
      </div>
    </section>
  );
}

function RenderStage({ images }: { images: string[] }) {
  const [translateZ, setTranslateZ] = useState(650);

  useEffect(() => {
    const update = () => {
      setTranslateZ(window.innerWidth <= 768 ? 250 : 650);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="stageContainer">
      <div className="stage">
        <div className="control">
          <div className="imgWrap">
            {images.map((img, i) => (
              <div
                className="img"
                key={i}
                style={{
                  transform: `rotateY(${35 + (i + 1) * 45}deg) translateZ(${translateZ}px)`,
                }}
              >
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
