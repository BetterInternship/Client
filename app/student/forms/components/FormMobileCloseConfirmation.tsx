"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FormMobileCloseConfirmationProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function FormMobileCloseConfirmation({
  open,
  onCancel,
  onConfirm,
}: FormMobileCloseConfirmationProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-[0.33em] bg-white p-5 shadow-xl"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Exit form?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              If you exit now, your progress will be lost.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Continue editing
              </Button>
              <Button type="button" className="flex-1" onClick={onConfirm}>
                Exit
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
