"use client";

import { useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { ROUND3_UPPER, ROUND3_MID, ROUND3_LOWER } from "@/data/teams";
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
        2026-2027赛季 84452韭菜杯 第三轮抽签仪式
      </h1>
      <h2 className="text-lg sm:text-xl text-white mt-2">
        2026-2027 Season &nbsp;&nbsp;84452 LEEK CUP DRAW CEREMONY ROUND 3
      </h2>

      <RoundDrawSection
        title="胜者组抽签池"
        subtitle="Upper Bracket Round 3"
        bracketTitle="2-0 胜者组"
        bracketSubtitle="Upper Bracket R3"
        group={ROUND3_UPPER}
        state={upper}
        infoPrefix="info-"
        cols={3}
      />
      <RoundDrawSection
        title="败者组抽签池"
        subtitle="Lower Bracket Round 3"
        bracketTitle="1-1 败者组"
        bracketSubtitle="1-1 Lower Bracket R3"
        group={ROUND3_MID}
        state={mid}
        infoPrefix="info2-"
        cols={4}
      />
      <RoundDrawSection
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
