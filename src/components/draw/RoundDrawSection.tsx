"use client";

import { useEffect, useState } from "react";
import type { Team } from "@/types";
import type { useDrawState } from "@/utils/drawUtils";

type DrawState = ReturnType<typeof useDrawState>;

interface RoundDrawSectionProps {
  title: string;
  subtitle: string;
  bracketTitle: string;
  bracketSubtitle: string;
  group: Record<number, Team>;
  state: DrawState;
  infoPrefix: string;
  cols?: number;
  stageTranslateZ?: number;
  mobileStageTranslateZ?: number;
}

export function RoundDrawSection({
  title,
  subtitle,
  bracketTitle,
  bracketSubtitle,
  group,
  state,
  infoPrefix,
  cols = 4,
  stageTranslateZ = 550,
  mobileStageTranslateZ,
}: RoundDrawSectionProps) {
  const indices = Object.keys(group).map(Number);

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
        <RenderStage
          group={group}
          indices={indices.slice(0, 6)}
          translateZ={stageTranslateZ}
          mobileTranslateZ={mobileStageTranslateZ}
        />
        {indices.length > 7 ? (
          <RenderStage
            group={group}
            indices={indices.slice(6, 12)}
            translateZ={stageTranslateZ}
            mobileTranslateZ={mobileStageTranslateZ}
          />
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

function RenderStage({
  group,
  indices,
  translateZ,
  mobileTranslateZ,
}: {
  group: Record<number, Team>;
  indices: number[];
  translateZ: number;
  mobileTranslateZ?: number;
}) {
  const [distance, setDistance] = useState(translateZ);

  useEffect(() => {
    if (!mobileTranslateZ) return;

    const update = () => {
      setDistance(window.innerWidth <= 768 ? mobileTranslateZ : translateZ);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [mobileTranslateZ, translateZ]);

  return (
    <div className="stageContainer">
      <div className="stage">
        <div className="control">
          <div className="imgWrap">
            {indices.map((idx, i) => (
              <div
                className="img"
                key={idx}
                style={{
                  transform: `rotateY(${35 + (i + 1) * 60}deg) translateZ(${distance}px)`,
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
  for (let i = 0; i < indices.length; i += cols) {
    chunks.push(indices.slice(i, i + cols));
  }

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
  for (let i = 0; i < randomArr.length; i += 2) {
    pairs.push([randomArr[i], randomArr[i + 1]]);
  }

  return (
    <div className="r-match-table">
      {pairs.map(([teamA, teamB], i) => {
        const pairNum = i + 1;
        const revealA = arr.includes(pairNum * 2);
        const revealB = arr.includes(pairNum * 2 + 1);

        return (
          <div className="r-match-table-row" key={i}>
            <div
              className={`r-match-table-team ${infoPrefix}${pairNum * 2 - 1}`}
            >
              <div>
                {revealA && teamA && <img src={group[teamA].img} alt="logo" />}
              </div>
              <div>{revealA && teamA ? group[teamA].name : null}</div>
            </div>
            <div>vs</div>
            <div className={`r-match-table-team ${infoPrefix}${pairNum * 2}`}>
              <div>
                {revealB && teamB && <img src={group[teamB].img} alt="logo" />}
              </div>
              <div>{revealB && teamB ? group[teamB].name : null}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
