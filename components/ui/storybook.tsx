import React, { Children, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@betterinternship/components";

export const StoryBook = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const currentChild = useMemo(
    () => Children.toArray(children)[currentStep],
    [children, currentStep],
  );

  const swipeVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentStep((prev) =>
      Math.min(
        Math.max(prev + newDirection, 0),
        Children.toArray(children).length - 1,
      ),
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[100vh]">
      <div className="relative overflow-visible h-fit">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={swipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.16, ease: "easeInOut" }}
            className="absolute top-0 left-0  w-full h-fit "
          >
            {currentChild}
          </motion.div>
        </AnimatePresence>
        <div className="invisible pointer-events-none">{currentChild}</div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        {currentStep !== 0 && (
          <Button size="xs" variant="outline" onClick={() => paginate(-1)}>
            Prev
          </Button>
        )}
        {currentStep !== Children.toArray(children).length - 1 && (
          <Button size="xs" onClick={() => paginate(1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
