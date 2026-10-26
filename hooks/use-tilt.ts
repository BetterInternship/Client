"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";

/**
 * Tilts an element so its face turns toward the mouse: hover near the right
 * and it angles right, near the top and it angles up.
 *
 * The pointer is read on a still outer element (`containerProps`) while the
 * inner one (`ref`) is what turns — measure the turning element itself and its
 * own tilt would move the edges out from under the cursor, and the angle would
 * flutter at the borders. Mouse only (a finger has no hover), and nothing moves
 * under prefers-reduced-motion. Styles are set straight on the node: a
 * re-render per pointer move would be wasted work.
 *
 * The angle is written once per animation frame, not once per event, and with
 * the transition switched off while the mouse moves: a transition restarted on
 * every event leaves the face permanently chasing the cursor, which reads as
 * lag. The class's transition is restored on the way out, so going home eases.
 *
 * Give the container `perspective`, and the inner element a `transition` on
 * `transform`.
 *
 * @hook
 * @param max - Greatest tilt, in degrees, at the very edge.
 * @param scale - How far the element grows while tilted.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 10,
  scale = 1.03,
}: { max?: number; scale?: number } = {}) {
  const ref = useRef<T>(null);
  const latest = useRef<{ el: HTMLElement; x: number; y: number } | undefined>(
    undefined,
  );
  const frame = useRef(0);

  const follow = useCallback(() => {
    frame.current = 0;
    const at = latest.current;
    const el = ref.current;
    if (!at || !el) return;

    const rect = at.el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // -0.5 at the left / top edge, +0.5 at the right / bottom.
    const x = (at.x - rect.left) / rect.width - 0.5;
    const y = (at.y - rect.top) / rect.height - 0.5;
    el.style.transition = "none";
    // rotateY(+) turns the face right; rotateX(+) turns it up.
    el.style.transform = `rotateX(${(-y * 2 * max).toFixed(2)}deg) rotateY(${(x * 2 * max).toFixed(2)}deg) scale(${scale})`;
  }, [max, scale]);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      latest.current = { el: e.currentTarget, x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(follow);
    },
    [follow],
  );

  const onPointerLeave = useCallback(() => {
    latest.current = undefined;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;

    const el = ref.current;
    if (!el) return;
    // Back to the class's transition first, so this last step eases home.
    el.style.transition = "";
    el.style.transform = "";
  }, []);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return { ref, containerProps: { onPointerMove, onPointerLeave } };
}
