"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ScoreBoard3D = dynamic(() => import("@/components/score/ScoreBoard3D"), { ssr: false });

export default function ReviewPage() {
  return (
    <div style={{ position: "relative" }}>
      <Link href="/entrance" className="drawButton" style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        返回<br />Back
      </Link>
      <ScoreBoard3D />
    </div>
  );
}
