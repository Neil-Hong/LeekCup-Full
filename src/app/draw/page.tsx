"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactAudioPlayer from "react-audio-player";
import { TEAMS, STAGE_1, STAGE_2, STAGE_3 } from "@/data/teams";
import { rangeRam } from "@/utils/drawUtils";

const TOTAL_TEAMS = 24;

export default function DrawPage() {
  const [randomArr, setRandomArr] = useState<number[]>(() =>
    rangeRam([1, TOTAL_TEAMS], TOTAL_TEAMS),
  );
  const [count, setCount] = useState(1);
  const [arr, setArr] = useState<number[]>([]);
  const [flag, setFlag] = useState(true);

  const handleDraw = () => {
    const newCount = count + 1;
    setCount(newCount);
    setArr([...arr, count]);
    if (count === 1) {
      setFlag(true);
      setTimeout(() => setFlag(false), 6000);
    }
    const idx = count;
    if (idx >= 2 && idx <= TOTAL_TEAMS + 1) {
      const el = document.querySelector(`.info-${idx - 1}`);
      if (el) {
        el.classList.remove("whiteBackground");
        void (el as HTMLElement).offsetHeight;
        el.classList.add("whiteBackground");
      }
    }
  };

  const handleReset = () => {
    document.querySelectorAll("[class*='info-']").forEach((el) => {
      el.classList.remove("whiteBackground");
    });
    setCount(1);
    setArr([]);
    setRandomArr(rangeRam([1, TOTAL_TEAMS], TOTAL_TEAMS));
    setFlag(true);
  };

  const pairs: [number, number][] = [];
  for (let i = 0; i < randomArr.length; i += 2) {
    pairs.push([randomArr[i], randomArr[i + 1]]);
  }

  return (
    <div className="drawPageContainer text-center">
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
      <RenderStage images={STAGE_3} />

      <img src="/images/draw.png" className="drawImage" alt="drawScene" />

      <div className="flex flex-row flex-wrap justify-center gap-4 my-4">
        <button className="drawButton" onClick={handleDraw}>
          抽签
          <br />
          Draw
        </button>
        <button className="drawButton" onClick={handleReset}>
          重新抽签
          <br />
          Redraw
        </button>
      </div>

      {arr[0] === 1 && flag && (
        <div className="videoOverlay">
          <video controls={false} autoPlay muted className="overlayVideo">
            <source src="/video/drawVideo.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="match-table">
        {pairs.map(([teamA, teamB], i) => {
          const pairNum = i + 1;
          const revealA = arr.includes(pairNum * 2);
          const revealB = arr.includes(pairNum * 2 + 1);
          return (
            <div className="match-table-row" key={i}>
              <div className={`match-table-team info-${pairNum * 2 - 1}`}>
                <div>
                  {revealA && teamA && (
                    <img src={TEAMS[teamA].img} alt="logo" />
                  )}
                </div>
                <div>{revealA && teamA ? TEAMS[teamA].name : null}</div>
              </div>
              <div>vs</div>
              <div className={`match-table-team info-${pairNum * 2}`}>
                <div>
                  {revealB && teamB && (
                    <img src={TEAMS[teamB].img} alt="logo" />
                  )}
                </div>
                <div>{revealB && teamB ? TEAMS[teamB].name : null}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-[150px]" />
    </div>
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
