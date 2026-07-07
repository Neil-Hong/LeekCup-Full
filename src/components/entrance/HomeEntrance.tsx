"use client";

import dynamic from "next/dynamic";

const EntranceScene = dynamic(() => import("@/components/entrance/Entrance3D"), { ssr: false });

export default function HomeEntrance() {
  return <EntranceScene />;
}
