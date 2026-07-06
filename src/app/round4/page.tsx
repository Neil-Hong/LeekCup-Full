"use client";

import { useEffect, useState } from "react";
import { ROUND4_PLAYOFF, ROUND4_MATCHES } from "@/data/teams";
import { scrollAnimate } from "@/utils/drawUtils";
import Link from "next/link";

const TOTAL_MATCHES = 9;
const TOTAL_INPUTS = TOTAL_MATCHES * 2;

const createEmptyScores = () => {
  const init: Record<string, string> = {};
  for (let i = 1; i <= TOTAL_INPUTS; i++) init[`t${i}`] = "";
  return init;
};

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

export default function Round4Page() {
  const [input, setInput] = useState<Record<string, string>>(createEmptyScores);

  useEffect(() => {
    scrollAnimate(".r-match-table-row");
  }, []);

  useEffect(() => {
    for (let i = 1; i <= TOTAL_MATCHES; i++) {
      const a = Number(input[`t${i * 2 - 1}`]);
      const b = Number(input[`t${i * 2}`]);
      const elA = document.querySelector(`.info2-${i * 2 - 1}`);
      const elB = document.querySelector(`.info2-${i * 2}`);
      if (elA) elA.classList.toggle("greenBackground", a > b);
      if (elB) elB.classList.toggle("greenBackground", b > a);
    }
  }, [input]);

  return (
    <div className="ScoreBoard text-center">
      <BackBtn />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯 第四轮
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW ROUND 4
      </h2>
      <img
        src="/images/WinnerRoad.png"
        alt="road"
        className="max-w-full mx-auto"
      />

      <div className="draw-round2-4 mt-10">
        <div className="club-bracket" style={{ backgroundColor: "green" }}>
          <h1 className="text-xl text-white">晋级池</h1>
          <h2 className="text-sm text-white/70">Playoff Bracket Round 4</h2>
          <div>
            <img
              src={ROUND4_PLAYOFF[1].img}
              alt={ROUND4_PLAYOFF[1].name}
              className="inline-block"
            />
            <img
              src={ROUND4_PLAYOFF[2].img}
              alt={ROUND4_PLAYOFF[2].name}
              className="inline-block"
            />
            <img
              src={ROUND4_PLAYOFF[3].img}
              alt={ROUND4_PLAYOFF[3].name}
              className="inline-block"
            />
          </div>
        </div>
        <div className="club-bracket" style={{ backgroundColor: "red" }}>
          <h1 className="text-xl text-white">淘汰池</h1>
          <h2 className="text-sm text-white/70">Eliminated Bracket Round 4</h2>
          <div>
            <img
              src={ROUND4_PLAYOFF[4].img}
              alt={ROUND4_PLAYOFF[4].name}
              className="inline-block"
            />
            <img
              src={ROUND4_PLAYOFF[5].img}
              alt={ROUND4_PLAYOFF[5].name}
              className="inline-block"
            />
            <img
              src={ROUND4_PLAYOFF[6].img}
              alt={ROUND4_PLAYOFF[6].name}
              className="inline-block"
            />
          </div>
        </div>
      </div>

      <div className="ScoreBoard-button-container mt-4">
        <Link href="/stats" className="drawButton">
          技术统计
          <br />
          Stats
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-6">
        第四轮对阵
      </h1>
      <h2 className="text-lg sm:text-xl text-white">Round 4 Match Table</h2>

      <div className="stageContainer-container">
        <RenderStage indices={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />
        <RenderStage indices={[10, 11, 12, 13, 14, 15, 16, 17, 18]} />
      </div>

      <div className="draw-round2-4">
        <div className="r-match-table" style={{ width: "min(60%, 800px)" }}>
          {Array.from({ length: TOTAL_MATCHES }, (_, i) => {
            const a = i * 2 + 1;
            const b = i * 2 + 2;
            return (
              <div className="r-match-table-row" key={i}>
                <div className={`r-match-table-1-info info2-${a}`}>
                  <div>
                    <img src={ROUND4_MATCHES[a].img} alt="" />
                  </div>
                  <div>{ROUND4_MATCHES[a].name}</div>
                  <input
                    type="number"
                    name={`t${a}`}
                    value={input[`t${a}`] || ""}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>vs</div>
                <div className={`r-match-table-2-info info2-${b}`}>
                  <input
                    type="number"
                    name={`t${b}`}
                    value={input[`t${b}`] || ""}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <img src={ROUND4_MATCHES[b].img} alt="" />
                  </div>
                  <div>{ROUND4_MATCHES[b].name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-[100px]" />
    </div>
  );
}

function RenderStage({ indices }: { indices: number[] }) {
  return (
    <div className="stageContainer4">
      <div className="stage">
        <div className="control">
          <div className="imgWrap">
            {indices.map((idx, i) => (
              <div
                className="img"
                key={i}
                style={{
                  transform: `rotateY(${35 + (i + 1) * 40}deg) translateZ(750px)`,
                }}
              >
                <img
                  src={ROUND4_MATCHES[idx].img}
                  alt={ROUND4_MATCHES[idx].name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
