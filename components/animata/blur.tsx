import { Transition, useReducedMotion } from "framer-motion";

type BlurTransitionOptions = {
  duration?: number;
  delay?: number;
  scale?: number;
  blurPx?: number;
};

/**
 * A transition for elements that blurs them in and out of existence.
 * Note that you may need an <AnimatePresence> component if you're conditionally mounting whatever it is you're animating.
 * @param options Duration in seconds, delay in seconds, initial and exit scale, and blur intensity.
 * @returns
 */
export function useBlurTransition(options: BlurTransitionOptions = {}) {
  const reduceMotion = useReducedMotion();
  const { duration = 0.3, delay = 0, scale = 0.98, blurPx = 4 } = options;

  const transition: Transition = {
    duration: reduceMotion ? 0 : duration,
    delay,
    ease: "easeOut",
  };

  return {
    initial: reduceMotion
      ? false
      : { scale, filter: `blur(${blurPx}px)`, opacity: 0 },
    animate: reduceMotion
      ? { opacity: 1 }
      : { scale: 1, filter: "blur(0px)", opacity: 1 },
    exit: reduceMotion
      ? { opacity: 0 }
      : { scale, filter: `blur(${blurPx}px)`, opacity: 0 },
    transition,
  };
}
