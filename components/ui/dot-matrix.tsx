"use client";

import { useEffect, useRef } from "react";
import { cn } from "@betterinternship/components";

/** Pitch between dots, dot radius, and the margin around the grid, in CSS px. */
const STEP = 14;
const RADIUS = 1.4;
const EDGE = 16;

/** The brand royal blue (`--primary` in @betterinternship/components). */
const DOT_COLOR = "#0b5493";

type Dot = {
  x: number;
  y: number;
  /** Where this dot sits in each of the two waves, worked out once. */
  a: number;
  b: number;
};

/**
 * The "still being drawn" tile: a fine lattice of dots on the page's own
 * background.
 *
 * Every dot takes its brightness from the same two crossing waves, so the
 * pattern moves as one — bright bands sweeping diagonally through the grid —
 * rather than five hundred dots twinkling independently. Both waves are slow
 * sines, so nothing ever jumps from one brightness to the next.
 *
 * Safe to mount on every slide: it only builds and animates while it's on
 * screen, so the slides waiting off to the side cost nothing.
 */
export function DotMatrix({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = DOT_COLOR;

      const columns = Math.max(1, Math.floor((width - EDGE * 2) / STEP) + 1);
      const rows = Math.max(1, Math.floor((height - EDGE * 2) / STEP) + 1);
      const left = (width - (columns - 1) * STEP) / 2;
      const top = (height - (rows - 1) * STEP) / 2;

      dots = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = left + column * STEP;
          const y = top + row * STEP;
          dots.push({
            x,
            y,
            a: x * 0.06 + y * 0.016,
            b: y * 0.07 - x * 0.024,
          });
        }
      }
    };

    const paint = (time: number) => {
      if (!dots.length) return;
      const seconds = time / 1000;
      context.clearRect(0, 0, width, height);
      for (const dot of dots) {
        // Two waves, travelling in different directions. Their product is
        // bright only where both crest, so the lattice is covered in soft
        // patches that drift across it.
        const first = 0.5 + 0.5 * Math.sin(dot.a + seconds * 2.6);
        const second = 0.5 + 0.5 * Math.sin(dot.b - seconds * 2.0);
        const field = first * second;
        context.globalAlpha = 0.09 + 0.6 * field * field;
        context.beginPath();
        context.arc(dot.x, dot.y, RADIUS, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      paint(time);
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const start = () => {
      // The first time it comes into view: lay the grid out for the size it
      // actually has. Anything still off to the side keeps a tiny bitmap.
      if (!dots.length || width !== canvas.clientWidth) build();
      paint(performance.now());
      if (still || frame) return;
      frame = requestAnimationFrame(loop);
    };

    // Only the slide on screen earns a frame loop; the rest hold whichever
    // frame they were drawn with.
    const seen = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "80px" },
    );
    seen.observe(canvas);

    // The tile is square and sized by the carousel, so this only really fires
    // when the viewport changes.
    const resized = new ResizeObserver(() => {
      if (!dots.length) return;
      build();
      paint(performance.now());
    });
    resized.observe(canvas);

    return () => {
      stop();
      seen.disconnect();
      resized.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 size-full", className)}
    />
  );
}
