"use client";

import { useAppContext } from "@/lib/ctx-app";
import { useRef, useCallback, useEffect } from "react";

export const useMobile = () => {
  const { isMobile } = useAppContext();

  // Refs for touch event handling
  const touchLastTargets = useRef<{
    start: EventTarget | null;
    end: EventTarget | null;
  }>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    target: EventTarget | null;
  }>(null);
  const touchEndRef = useRef<{
    x: number;
    y: number;
    target: EventTarget | null;
  }>(null);
  const touchDeltas = useRef<{
    x: number;
    y: number;
  }>(null);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target,
      };
    },
    [isMobile],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target,
      };

      // Compute deltas
      const deltaX = Math.abs(touchEndRef.current.x - touchStartRef.current.x);
      const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
      touchDeltas.current = { x: deltaX, y: deltaY };

      // Compute targets
      touchLastTargets.current = {
        start: touchStartRef.current.target,
        end: touchEndRef.current.target,
      };
    },
    [isMobile],
  );

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  });

  // Checks whether or not the touch move happened across a single element
  const isTouchEndOnElement = (e: EventTarget | null) => {
    if (!e) return false;
    return touchLastTargets.current?.end === e;
  };

  // Checks whether or not the touch move happened across a single element
  const isTouchOnSingleElement = () => {
    return touchLastTargets.current?.start === touchLastTargets.current?.end;
  };

  // Was the move a swipe?
  const isSwipe = () => {
    const [x = 0, y = 0] = getTouchDeltas();
    return x > 10 || y > 10;
  };

  // Returns touch distances along x and y
  const getTouchDeltas = () => {
    return [touchDeltas.current?.x, touchDeltas.current?.y];
  };

  return {
    isMobile,
    isTouchOnSingleElement,
    isTouchEndOnElement,
    isSwipe,
    getTouchDeltas,
  };
};
