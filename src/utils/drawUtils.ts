"use client";

import { useState, useEffect } from "react";
import type { DrawState } from "@/types";

export const rangeRam = (range: [number, number], count: number): number[] => {
  const ramArr: number[] = [];
  const result: number[] = [];

  for (let i = range[0]; i <= range[1]; i++) {
    ramArr.push(i);
  }

  for (; count > 0; count--) {
    const ram = Math.floor(Math.random() * (ramArr.length - 1));
    result.push(ramArr[ram]);
    ramArr[ram] = ramArr[ramArr.length - 1];
    ramArr.pop();
  }

  return result;
};

const isElementInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();
  return (
    (rect.top <= 0 && rect.bottom >= 0) ||
    (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)) ||
    (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
  );
};

export const scrollAnimate = (selector: string, animClass = "scale-in-hor-center"): void => {
  const scroll =
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    function (callback: FrameRequestCallback) { window.setTimeout(callback, 1000 / 60); };

  const elementsToShow = document.querySelectorAll(selector);

  function loop() {
    elementsToShow.forEach(function (element) {
      if (isElementInViewport(element)) {
        element.classList.add(animClass);
      } else {
        element.classList.remove(animClass);
      }
    });
    scroll(loop);
  }

  loop();
};

export const useDrawState = (size: number, infoPrefix: string): DrawState => {
  const [randomArr, setRandomArr] = useState<number[]>([]);
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
    if (idx >= 2 && idx <= size + 1) {
      const el = document.querySelector(`.${infoPrefix}${idx - 1}`);
      if (el) {
        el.classList.remove("whiteBackground");
        void (el as HTMLElement).offsetHeight;
        el.classList.add("whiteBackground");
      }
    }
  };

  const handleReset = () => {
    document.querySelectorAll(`[class*="${infoPrefix}"]`).forEach((el) => {
      el.classList.remove("whiteBackground");
    });
    setCount(1);
    setArr([]);
    setRandomArr(rangeRam([1, size], size));
    setFlag(true);
  };

  useEffect(() => {
    setRandomArr(rangeRam([1, size], size));
  }, [size]);

  return { randomArr, count, arr, flag, handleDraw, handleReset };
};
