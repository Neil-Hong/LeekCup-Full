"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const options = {
  autoplay: "any" as const,
  controls: true,
  preload: "auto" as const,
  responsive: true,
  fluid: true,
  sources: [{ src: "/reviewVideo.mp4", type: "video/mp4" }],
};

export default function VideoPlayer() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!playerRef.current && placeholderRef.current) {
      const videoElement = placeholderRef.current.appendChild(
        document.createElement("video-js")
      );
      playerRef.current = videojs(videoElement, options, () => {
        playerRef.current?.log("player ready");
      });
    } else if (playerRef.current) {
      playerRef.current.autoplay(options.autoplay);
      playerRef.current.src(options.sources);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return <div ref={placeholderRef} />;
}
