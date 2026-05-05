/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-21 02:46:39
 * @ Modified time: 2026-03-05 16:48:33
 * @ Description:
 */

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
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A modal instance represents a modal in the registry of the global modal context.
 */
interface ModalInstance {
  node: React.ReactNode;
  opts: ModalOptions;
}
type ModalInstanceOpener = (
  name: string,
  layout: React.FC<ModalInjectedParams & ModalContext>,
  content: React.ReactNode,
  opts?: ModalOptions,
) => void;
type ModalInstanceCloser = (name?: string) => void;

/**
 * These are options used to configure each modal instance.
 */
interface ModalOptions {
  // Allow exiting by clicking outside modal; default: true
  closeOnBackdropClick?: boolean;

  // Allow exiting by usign escape key; default true
  closeOnEscapeKey?: boolean; // default: true

  // Show a close (X) button; default: true
  showCloseButton?: boolean;

  // Called AFTER the modal is unmounted
  onClose?: () => void;
  onRequestClose?: () => void;

  // ! Hmm this should not be done this way
  panelClassName?: string;
  title?: React.ReactNode;
  showHeaderDivider?: boolean;
  mobileFullscreen?: boolean;
}

/**
 * Injected modal parameters.
 * These must be defined by every modal component to be compatible with the global modal system.
 */
export interface ModalInjectedParams {
  name: string;
  children: React.ReactNode;
}

/**
 * The context available to each modal instance.
 */
export interface ModalContext {
  openModal: ModalInstanceOpener;
  closeModal: ModalInstanceCloser;
}

const ModalCtx = createContext<ModalContext>({} as ModalContext);

export const useGlobalModal = () => useContext(ModalCtx);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, ModalInstance>>({});

  const openModal = useCallback<ModalInstanceOpener>(
    (name, Layout, content, opts = {}) => {
      setRegistry((m) => ({
        ...m,
        [name]: {
          node: (
            <Layout
              name={name}
              openModal={openModal}
              closeModal={closeModal}
              {...opts}
            >
              {content}
            </Layout>
          ),
          opts,
        },
      }));
    },
    [],
  );

  const closeModal = useCallback<ModalInstanceCloser>((name) => {
    const onCloseCallbacks: Array<() => void> = [];

    setRegistry((m) => {
      if (!name) {
        Object.values(m).forEach((e) => {
          if (e.opts.onClose) onCloseCallbacks.push(e.opts.onClose);
        });
        return {};
      }

      const entry = m[name];
      if (entry?.opts.onClose) onCloseCallbacks.push(entry.opts.onClose);
      const { [name]: _removed, ...rest } = m;
      return rest;
    });

    queueMicrotask(() => {
      onCloseCallbacks.forEach((callback) => callback());
    });
  }, []);

  // Body scroll lock + iOS --vh fix when ANY modal is open
  useEffect(() => {
    const count = Object.keys(registry).length;
    if (count === 0) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalLeft = document.body.style.left;
    const originalRight = document.body.style.right;
    const originalWidth = document.body.style.width;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overscrollBehavior = "none";
    let focusUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

    const setVH = () => {
      const visualViewport = window.visualViewport;
      const viewportHeight =
        visualViewport?.height && Number.isFinite(visualViewport.height)
          ? visualViewport.height
          : window.innerHeight;
      const viewportOffsetTop =
        visualViewport?.offsetTop && Number.isFinite(visualViewport.offsetTop)
          ? visualViewport.offsetTop
          : 0;

      document.documentElement.style.setProperty(
        "--vh",
        `${viewportHeight * 0.01}px`,
      );
      document.documentElement.style.setProperty(
        "--modal-viewport-top",
        `${viewportOffsetTop}px`,
      );
    };

    const handleFocusChange = () => {
      // Defer once so mobile keyboard close/open settles before measuring.
      if (focusUpdateTimeout) clearTimeout(focusUpdateTimeout);
      focusUpdateTimeout = window.setTimeout(setVH, 60);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);
    window.visualViewport?.addEventListener("resize", setVH);
    window.visualViewport?.addEventListener("scroll", setVH);
    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.right = originalRight;
      document.body.style.width = originalWidth;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
      document.documentElement.style.removeProperty("--vh");
      document.documentElement.style.removeProperty("--modal-viewport-top");
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
      window.visualViewport?.removeEventListener("resize", setVH);
      window.visualViewport?.removeEventListener("scroll", setVH);
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
      if (focusUpdateTimeout) clearTimeout(focusUpdateTimeout);
      window.scrollTo(0, scrollY);
    };
  }, [registry]);

  // ESC to close the top-most modal that allows it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const entries = Object.entries(registry);
      if (!entries.length) return;
      const [lastName, lastEntry] = entries[entries.length - 1];
      if (lastEntry.opts.closeOnEscapeKey !== false) closeModal(lastName);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [registry, closeModal]);

  const portals = useMemo(() => {
    if (typeof document === "undefined") return null;

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
              transition={{
                duration: 0.2,
                ease: "easeOut",
                when: "afterChildren",
              }}
              className={cn(
                // Backdrop container
                "fixed inset-0 z-[1000] bg-black/10 backdrop-blur-sm",
                // Mobile: dock to bottom; Desktop+: center
                "flex items-end justify-center p-0",
                "sm:items-center sm:justify-center",
              )}
              ref={backdropRef}
              role="dialog"
              aria-modal="true"
              style={
                opts.mobileFullscreen
                  ? undefined
                  : {
                      height: "calc(var(--vh, 1vh) * 100)",
                      top: "var(--modal-viewport-top, 0px)",
                      bottom: "auto",
                    }
              }
              onClick={(e) => {
                if (opts.closeOnBackdropClick === false) return;
                if (e.target === backdropRef.current) closeModal(name);
              }}
              onTouchEnd={(e) => {
                if (opts.closeOnBackdropClick === false) return;
                if (e.target === backdropRef.current) closeModal(name);
              }}
            >
              {node}
            </motion.div>
          );
        })}
      </AnimatePresence>,
      document.body,
    );
  }, [registry, closeModal]);

  return (
    <ModalCtx.Provider value={{ openModal, closeModal }}>
      {children}
      {portals}
    </ModalCtx.Provider>
  );
}
