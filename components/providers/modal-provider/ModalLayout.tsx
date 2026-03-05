/**
 * @ Author: BetterInternship
 * @ Create Time: 2026-03-04 17:30:31
 * @ Modified time: 2026-03-05 16:45:36
 * @ Description:
 *
 * This file contains reusable modal layouts so we don't have to pass too many options when opening modals.
 * Think of it this way: we have modals that lay on the center of the page, modals that pop up from below, etc.
 * Instead of passing options to change between these modals and let the ModalProvider make all the decisions,
 *  we pass a template of each of these modals instead.
 * This keeps the ModalProvider cleaner and prevents it from becoming a god class.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ModalContext, ModalInjectedParams } from "./ModalProvider";
import { Button } from "@/components/ui/button";

interface DefaultModalLayout {
  title?: React.ReactNode;
  showHeaderDivider?: boolean;
  showCloseButton?: boolean;
}

export const DefaultModalLayout = ({
  name,
  title,
  children,
  showHeaderDivider,
  showCloseButton,
  closeModal,
}: DefaultModalLayout & ModalInjectedParams & ModalContext) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
        mass: 0.8,
      }}
      className={cn(
        // Base panel
        "bg-white overflow-visible shadow-2xl relative border",
        // Mobile: full-width bottom sheet, rounded top only
        "w-full max-w-full min-w-[100svw] rounded-t-[0.33em] rounded-b-none",
        // Let content grow but cap height properly
        "max-h-[calc(var(--vh,1vh)*100)]",
        // Desktop+: classic centered card
        "sm:rounded-[0.33em] sm:w-auto sm:max-w-2xl sm:min-w-0 sm:max-h-[90vh]",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {(title || showCloseButton !== false) && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3",
            showHeaderDivider ? "border-b" : "",
          )}
        >
          {title ? (
            typeof title === "string" ? (
              <h2 className="text-base font-semibold truncate">{title}</h2>
            ) : (
              <div className="flex-1 min-w-0">{title}</div>
            )
          ) : (
            <div className="flex-1" />
          )}
          {showCloseButton !== false && (
            <button
              aria-label="Close"
              onClick={() => closeModal(name)}
              className="h-8 w-8 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center shrink-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="px-4 pb-4 overflow-auto visible max-h-[calc(var(--vh,1vh)*100-4rem)] sm:max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>

      <div className="pb-safe h-4 sm:hidden" />
    </motion.div>
  );
};

interface SlideUpModalLayout {
  title?: React.ReactNode;
  showHeaderDivider?: boolean;
  showCloseButton?: boolean;
}

export const SlideUpModalLayout = ({
  name,
  title,
  children,
  showCloseButton,
  closeModal,
}: SlideUpModalLayout & ModalInjectedParams & ModalContext) => {
  const shouldShowCloseButton = showCloseButton !== false;

  return (
    <>
      {shouldShowCloseButton && (
        <motion.button
          type="button"
          onClick={() => closeModal(name)}
          className="absolute inset-0 h-full w-full bg-black/50"
          aria-label="Close modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[90vh] rounded-t-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
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
              {title ?? "Details"}
            </h2>
            {shouldShowCloseButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => closeModal(name)}
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </motion.div>
    </>
  );
};
