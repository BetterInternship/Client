"use client";

import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface FlowTestPreviewModalProps {
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FlowTestPreviewModal({
  documentUrl,
  isOpen,
  onClose,
}: FlowTestPreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-black/50"
            aria-label="Close PDF preview"
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[90vh] rounded-t-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="PDF Preview"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
              mass: 0.8,
            }}
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-base font-semibold text-slate-900">
                  PDF Preview
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 p-4">
                <FormPreviewPdfDisplay
                  documentUrl={documentUrl}
                  blocks={[]}
                  values={{}}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
