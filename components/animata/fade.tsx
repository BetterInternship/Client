/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-09-25 22:06:44
 * @ Modified time: 2025-09-25 22:51:18
 * @ Description:
 *
 * Work in progress -> factor out animations here so we can use them more easily
 */

import { AnimatePresence, Easing, motion } from "framer-motion";
import { forwardRef, useImperativeHandle, useState } from "react";

/**
 * A component for fade ins
 *
 */
interface FadeInProps {
  duration?: number;
  ease?: Easing;
  children: React.ReactNode;
}

export const FadeIn = forwardRef(
  ({ children, duration = 0.6, ease = "easeInOut" }: FadeInProps, ref) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease }}
      >
        {children}
      </motion.div>
    );
  }
);

/**
 * A component for fade outs
 *
 */
interface FadeOutProps {
  duration?: number;
  ease?: Easing;
  children: React.ReactNode;
}

export const FadeOut = forwardRef(
  ({ children, duration = 0.6, ease = "easeInOut" }: FadeOutProps, ref) => {
    const [close, setClose] = useState(false);
    useImperativeHandle(ref, () => ({
      exit() {
        setClose(true);
      },
    }));

    return (
      <AnimatePresence>
        {!close && (
          <motion.div
            layout
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration, ease } }}
            className=""
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
