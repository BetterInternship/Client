"use client";

import { useCallback, useRef, type PointerEvent } from "react";

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
 * Give the container `perspective`, and the inner element a `transition` on
 * `transform` so each step eases rather than snaps.
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

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = e.currentTarget.getBoundingClientRect();
      // -0.5 at the left / top edge, +0.5 at the right / bottom.
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // rotateY(+) turns the face right; rotateX(+) turns it up.
      el.style.transform = `rotateX(${(-y * 2 * max).toFixed(2)}deg) rotateY(${(x * 2 * max).toFixed(2)}deg) scale(${scale})`;
    },
    [max, scale],
  );

  const onPointerLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, containerProps: { onPointerMove, onPointerLeave } };
}
