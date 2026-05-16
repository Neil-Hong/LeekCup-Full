"use client";

import { useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { ROUND3_UPPER, ROUND3_MID, ROUND3_LOWER } from "@/data/teams";
import { useDrawState, scrollAnimate } from "@/utils/drawUtils";
import type { Team } from "@/types";
import Link from "next/link";

function BackBtn() {
  return (
    <Link
      href="/"
      className="fixed top-3 right-3 z-50 text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-lg transition-colors no-underline border border-white/20"
    >
      返回
      <br />
      Back
    </Link>
  );
}

export default function Round3Page() {
  const upper = useDrawState(6, "info-");
  const mid = useDrawState(12, "info2-");
  const lower = useDrawState(6, "info3-");
  const showVideo =
    (upper.arr[0] === 1 && upper.flag) ||
    (mid.arr[0] === 1 && mid.flag) ||
    (lower.arr[0] === 1 && lower.flag);

  useEffect(() => {
    scrollAnimate(".r-match-table-row");
  }, []);

  return (
    <div className="ScoreBoard text-center">
      <BackBtn />
      <ReactAudioPlayer src="/audio/theme.mp3" autoPlay loop volume={0.3} />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2022-2023赛季 84452韭菜杯 第三轮抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2022-2023 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY ROUND 3
      </h2>

      <DrawSection
        title="胜者组抽签池"
        subtitle="Upper Bracket Round 3"
        bracketTitle="2-0 胜者组"
        bracketSubtitle="Upper Bracket R3"
        group={ROUND3_UPPER}
        state={upper}
        infoPrefix="info-"
        cols={3}
      />
      <DrawSection
        title="败者组抽签池"
        subtitle="Lower Bracket Round 3"
        bracketTitle="1-1 败者组"
        bracketSubtitle="1-1 Lower Bracket R3"
        group={ROUND3_MID}
        state={mid}
        infoPrefix="info2-"
        cols={4}
      />
      <DrawSection
        title=""
        subtitle=""
        bracketTitle="0-2 败者组"
        bracketSubtitle="0-2 Lower Bracket R3"
        group={ROUND3_LOWER}
        state={lower}
        infoPrefix="info3-"
        cols={3}
      />

      {showVideo && (
        <div className="videoOverlay">
          <video controls={false} autoPlay muted className="overlayVideo">
            <source src="/video/drawVideo.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="h-[100px]" />
    </div>
  );
}

function RenderStage({
  group,
  indices,
}: {
  group: Record<number, Team>;
  indices: number[];
}) {
  return (
    <div className="stageContainer">
      <div className="stage">
        <div className="control">
          <div className="imgWrap">
            {indices.map((idx, i) => (
              <div
                className="img"
                key={i}
                style={{
                  transform: `rotateY(${35 + (i + 1) * 60}deg) translateZ(550px)`,
                }}
              >
                <img src={group[idx].img} alt={group[idx].name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawSection({
  title,
  subtitle,
  bracketTitle,
  bracketSubtitle,
  group,
  state,
  infoPrefix,
  cols,
}: {
  title: string;
  subtitle: string;
  bracketTitle: string;
  bracketSubtitle: string;
  group: Record<number, Team>;
  state: ReturnType<typeof useDrawState>;
  infoPrefix: string;
  cols: number;
}) {
  const indices = Object.keys(group).map(Number);
  const total = indices.length;
  return (
    <>
      {title && (
        <h1 className="text-2xl sm:text-3xl text-white font-bold mt-6">
          {title}
        </h1>
      )}
      {subtitle && (
        <h2 className="text-lg sm:text-xl text-white">{subtitle}</h2>
      )}
      <div className="stageContainer-container">
        <RenderStage group={group} indices={indices.slice(0, 6)} />
        {indices.length > 7 ? (
          <RenderStage group={group} indices={indices.slice(6, 12)} />
        ) : null}
      </div>
      <div className="draw-round2">
        <BracketDisplay
          group={group}
          indices={indices}
          title={bracketTitle}
          subtitle={bracketSubtitle}
          cols={cols}
        />
        <MatchTable
          group={group}
          randomArr={state.randomArr}
          arr={state.arr}
          infoPrefix={infoPrefix}
        />
      </div>
      <div className="ScoreBoard-button-container">
        <button className="drawButton" onClick={state.handleDraw}>
          抽签
          <br />
          Draw
        </button>
        <button className="drawButton" onClick={state.handleReset}>
          重新抽签
          <br />
          Redraw
        </button>
      </div>
    </>
  );
}

function BracketDisplay({
  group,
  indices,
  title,
  subtitle,
  cols,
}: {
  group: Record<number, Team>;
  indices: number[];
  title: string;
  subtitle: string;
  cols: number;
}) {
  const chunks: number[][] = [];
  for (let i = 0; i < indices.length; i += cols)
    chunks.push(indices.slice(i, i + cols));
  return (
    <div className="club-bracket">
      <h1 className="text-xl text-white">{title}</h1>
      <h3 className="text-sm text-white/70 mb-2">{subtitle}</h3>
      {chunks.map((chunk, ci) => (
        <div key={ci} className="mb-4">
          {chunk.map((idx) => (
            <img
              key={idx}
              src={group[idx].img}
              alt={group[idx].name}
              className="inline-block"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MatchTable({
  group,
  randomArr,
  arr,
  infoPrefix,
}: {
  group: Record<number, Team>;
  randomArr: number[];
  arr: number[];
  infoPrefix: string;
}) {
  const pairs: [number, number][] = [];
  for (let i = 0; i < randomArr.length; i += 2)
    pairs.push([randomArr[i], randomArr[i + 1]]);
  return (
    <div className="r-match-table">
      {pairs.map(([teamA, teamB], i) => {
        const pn = i + 1;
        return (
          <div className="r-match-table-row" key={i}>
            <div className={`r-match-table-team ${infoPrefix}${pn * 2 - 1}`}>
              <div>
                {arr.includes(pn * 2) && teamA && (
                  <img src={group[teamA].img} alt="logo" />
                )}
              </div>
              <div>
                {arr.includes(pn * 2) && teamA ? group[teamA].name : null}
              </div>
            </div>
            <div>vs</div>
            <div className={`r-match-table-team ${infoPrefix}${pn * 2}`}>
              <div>
                {arr.includes(pn * 2 + 1) && teamB && (
                  <img src={group[teamB].img} alt="logo" />
                )}
              </div>
              <div>
                {arr.includes(pn * 2 + 1) && teamB ? group[teamB].name : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
