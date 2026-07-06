"use client";

import { useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { ROUND16_UPPER, ROUND16_LOWER } from "@/data/teams";
import { useDrawState, scrollAnimate } from "@/utils/drawUtils";
import { RoundDrawSection } from "@/components/draw/RoundDrawSection";
import Link from "next/link";

function BackBtn() {
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

export default function Round16Page() {
  const upper = useDrawState(12, "info-");
  const lower = useDrawState(12, "info2-");
  const showVideo =
    (upper.arr[0] === 1 && upper.flag) || (lower.arr[0] === 1 && lower.flag);

  useEffect(() => {
    scrollAnimate(".r-match-table-row");
  }, []);

  return (
    <div className="ScoreBoard text-center">
      <BackBtn />
      <ReactAudioPlayer src="/audio/theme.mp3" autoPlay loop volume={0.3} />
      <h1 className="text-2xl sm:text-3xl text-white font-bold mt-4">
        2026-2027赛季 84452韭菜杯 第二轮抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY ROUND 2
      </h2>

      <RoundDrawSection
        title="胜者组抽签池"
        subtitle="Upper Bracket Round 2"
        bracketTitle="1-0 胜者组"
        bracketSubtitle="Upper Bracket R2"
        group={ROUND16_UPPER}
        state={upper}
        infoPrefix="info-"
        mobileStageTranslateZ={200}
      />
      <RoundDrawSection
        title="败者组抽签池"
        subtitle="Lower Bracket Round 2"
        bracketTitle="0-1 败者组"
        bracketSubtitle="Lower Bracket R2"
        group={ROUND16_LOWER}
        state={lower}
        infoPrefix="info2-"
        mobileStageTranslateZ={200}
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
