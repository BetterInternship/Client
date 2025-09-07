import { motion, useReducedMotion } from "framer-motion";

export function DoodleUnderline({ className = "" }: { className?: string }) {
  const prefersReduce = useReducedMotion();
  return (
    <svg
      className={`absolute -bottom-2 left-0 right-0 h-3 w-full ${className}`}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 7 C 20 1, 40 11, 60 3 S 95 9, 98 5"
        fill="none"
        stroke="url(#g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: prefersReduce ? 1 : 1 }}
        transition={{ duration: prefersReduce ? 0 : 1.2, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(220 90% 60% / 0.5)" />
          <stop offset="50%" stopColor="hsl(220 90% 55% / 0.8)" />
          <stop offset="100%" stopColor="hsl(220 90% 60% / 0.5)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
