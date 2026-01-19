"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ModalOptions = {
  allowBackdropClick?: boolean; // default: true
  closeOnEsc?: boolean; // default: true
  hasClose?: boolean; // default: true
  onClose?: () => void; // called AFTER the modal is removed
  backdropClassName?: string;
  panelClassName?: string;
  title?: React.ReactNode;
  headerClassName?: string;
  showHeaderDivider?: boolean;
  useCustomPanel?: boolean;
};

type RegistryEntry = { node: React.ReactNode; opts: ModalOptions };
type Open = (
  name: string,
  content: React.ReactNode,
  opts?: ModalOptions,
) => void;
type Close = (name?: string) => void;

const ModalCtx = createContext<{ open: Open; close: Close }>({
  open: () => {},
  close: () => {},
});

export const useGlobalModal = () => useContext(ModalCtx);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, RegistryEntry>>({});

  const open = useCallback<Open>((name, content, opts = {}) => {
    setRegistry((m) => ({ ...m, [name]: { node: content, opts } }));
  }, []);

  const close = useCallback<Close>((name) => {
    setRegistry((m) => {
      if (!name) {
        Object.values(m).forEach((e) => e.opts.onClose?.());
        return {};
      }
      const entry = m[name];
      entry?.opts.onClose?.();
      const { [name]: _removed, ...rest } = m;
      return rest;
    });
  }, []);

  // Body scroll lock + iOS --vh fix when ANY modal is open
  useEffect(() => {
    const count = Object.keys(registry).length;
    if (count === 0) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const setVH = () =>
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.removeProperty("--vh");
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, [registry]);

  // ESC to close the top-most modal that allows it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const entries = Object.entries(registry);
      if (!entries.length) return;
      const [lastName, lastEntry] = entries[entries.length - 1];
      if (lastEntry.opts.closeOnEsc !== false) close(lastName);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [registry, close]);

  const portals = useMemo(() => {
    const entries = Object.entries(registry);
    if (!entries.length) return null;

    return createPortal(
      <AnimatePresence>
        {entries.map(([name, { node, opts }]) => {
          const backdropRef = React.createRef<HTMLDivElement>();

          return (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={[
                // Backdrop container
                "fixed inset-0 z-[1000] bg-black/10 backdrop-blur-sm",
                // Mobile: dock to bottom; Desktop+: center
                "flex items-end justify-center p-0",
                "sm:items-center sm:justify-center",
                opts.backdropClassName ?? "",
              ].join(" ")}
              ref={backdropRef}
              role="dialog"
              aria-modal="true"
              style={{
                height: "calc(var(--vh, 1vh) * 100)",
              }}
              onClick={(e) => {
                if (opts.allowBackdropClick === false) return;
                if (e.target === backdropRef.current) close(name);
              }}
              onTouchEnd={(e) => {
                if (opts.allowBackdropClick === false) return;
                if (e.target === backdropRef.current) close(name);
              }}
            >
              {!opts.useCustomPanel ? (
                <motion.div
                  // Panel entrance: bottom-sheet slide on mobile, scale/raise on desktop
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                    mass: 0.8,
                  }}
                  className={[
                    // Base panel
                    "bg-white overflow-visible shadow-2xl relative border",
                    // Mobile: full-width bottom sheet, rounded top only
                    "w-full max-w-full min-w-[100svw] rounded-t-[0.33em] rounded-b-none",
                    // Let content grow but cap height properly
                    "max-h-[calc(var(--vh,1vh)*100)]",
                    // Desktop+: classic centered card
                    "sm:rounded-[0.33em] sm:w-auto sm:max-w-2xl sm:min-w-0 sm:max-h-[90vh]",
                    opts.panelClassName ?? "",
                  ].join(" ")}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header row: title (left) + close (right) */}
                  {(opts.title || opts.hasClose !== false) && (
                    <div
                      className={[
                        "flex items-center justify-between gap-3 px-4 py-3",
                        opts.showHeaderDivider ? "border-b" : "",
                        opts.headerClassName ?? "",
                      ].join(" ")}
                    >
                      {/* Title (optional) */}
                      {opts.title ? (
                        typeof opts.title === "string" ? (
                          <h2 className="text-base font-semibold truncate">
                            {opts.title}
                          </h2>
                        ) : (
                          <div className="flex-1 min-w-0">{opts.title}</div>
                        )
                      ) : (
                        <div className="flex-1" />
                      )}

                      {/* Close button (optional) */}
                      {opts.hasClose !== false && (
                        <button
                          aria-label="Close"
                          onClick={() => close(name)}
                          className="h-8 w-8 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center shrink-0"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Content area */}
                  <div className="h-full flex flex-col">
                    <div className="px-4 pb-4 overflow-visible max-h-[calc(var(--vh,1vh)*100-4rem)] sm:max-h-[calc(90vh-4rem)]">
                      {node}
                    </div>
                  </div>

                  {/* Mobile safe area spacer */}
                  <div className="pb-safe h-4 sm:hidden" />
                </motion.div>
              ) : (
                node
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>,
      document.body,
    );
  }, [registry, close]);

  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}
      {portals}
    </ModalCtx.Provider>
  );
}
