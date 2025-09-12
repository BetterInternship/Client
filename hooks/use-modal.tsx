"use client";

/**
 * Lightweight modal hook (no provider/registry).
 * Usage:
 *   const { Modal, open, close } = useModal("register-modal");
 *   <Button onClick={open}>Open</Button>
 *   <Modal>...content...</Modal>
 *
 * IMPORTANT:
 * - Call useModal() ONCE per modal instance (in the page/owner).
 * - Pass open()/close()/Modal to children via props.
 * - Do NOT call useModal("same-name") in another component to open the same modal.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  createElement,
  Ref,
} from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppContext } from "@/lib/ctx-app"; // should expose { isMobile }
import { useMobile } from "./use-mobile"; // touch helpers
import { cn } from "@/lib/utils";

/** Exposed for optional imperative usage */
export type ModalHandle = { open: () => void; close: () => void };

/** The main hook */
export const useModal = (
  name: string,
  options?: { onClose?: () => void; showCloseButton?: boolean }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showCloseButton = true } = options || {};
  const { isMobile } = useAppContext();
  const { isTouchOnSingleElement, isTouchEndOnElement, isSwipe } = useMobile();

  // For debug: track transitions
  useEffect(() => {
    console.debug(`[useModal:${name}] mounted`);
    return () => console.debug(`[useModal:${name}] unmounted`);
  }, [name]);

  // Desktop backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      if (e.target === backdropRef.current) {
        console.debug(`[useModal:${name}] backdrop click -> close`);
        setIsOpen(false);
      }
    },
    [isMobile, name]
  );

  // Lock body scroll + iOS --vh fix when open
  useEffect(() => {
    if (!isOpen) return;

    console.debug(`[useModal:${name}] open -> lock body`);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (isMobile) {
      const setVH = () => {
        document.documentElement.style.setProperty(
          "--vh",
          `${window.innerHeight * 0.01}px`
        );
      };
      setVH();
      window.addEventListener("resize", setVH);
      window.addEventListener("orientationchange", setVH);

      return () => {
        console.debug(`[useModal:${name}] close -> unlock body (mobile)`);
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.removeProperty("--vh");
        window.removeEventListener("resize", setVH);
        window.removeEventListener("orientationchange", setVH);
      };
    }

    return () => {
      console.debug(`[useModal:${name}] close -> unlock body`);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile, name]);

  // onClose callback after closing
  useEffect(() => {
    if (!isOpen && options?.onClose) {
      console.debug(`[useModal:${name}] onClose`);
      options.onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const open = useCallback(() => {
    console.debug(`[useModal:${name}] open()`);
    setIsOpen(true);
  }, [name]);

  const close = useCallback(() => {
    console.debug(`[useModal:${name}] close()`);
    setIsOpen(false);
  }, [name]);

  /** The modal renderer (overlay). Keep z-index high to avoid being hidden */
  const Modal = ({
    children,
    className,
    backdropClassName,
  }: {
    children?: React.ReactNode;
    className?: string; // e.g. "max-w-7xl w-full"
    backdropClassName?: string;
  }) => {
    if (!isOpen) return null;

    console.debug(`[useModal:${name}] render <Modal>`);

    return (
      <div
        ref={backdropRef}
        className={cn(
          "fixed inset-0 bg-black/10 flex z-[1000] backdrop-blur-sm",
          isMobile
            ? "items-end justify-center p-0"
            : "items-center justify-center p-4",
          backdropClassName
        )}
        onClick={handleBackdropClick}
        onTouchEnd={() => {
          if (
            !isSwipe() &&
            isTouchOnSingleElement() &&
            isTouchEndOnElement(backdropRef.current)
          ) {
            console.debug(`[useModal:${name}] touch backdrop -> close`);
            setIsOpen(false);
          }
        }}
        style={{
          height: isMobile ? "calc(var(--vh, 1vh) * 100)" : "100vh",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={panelRef}
          className={cn(
            "bg-white overflow-hidden shadow-2xl flex flex-col",
            isMobile
              ? "w-full max-w-full mx-0 rounded-t-sm rounded-b-none h-fit min-h-[200px] animate-in slide-in-from-bottom duration-300"
              : "w-full max-w-2xl rounded-sm h-fit animate-in fade-in zoom-in-95 duration-200",
            className
          )}
        >
          {showCloseButton && (
            <div className={cn("flex justify-end p-4", isMobile && "pb-2")}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.debug(`[useModal:${name}] close button click`);
                  setIsOpen(false);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  console.debug(`[useModal:${name}] close button touch`);
                  setIsOpen(false);
                }}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors",
                  isMobile && "active:bg-gray-200"
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          )}

          {/* content scroll area */}
          <div
            className={cn(
              showCloseButton && isMobile ? "pt-0" : "",
              "flex-1 overflow-hidden h-full min-h-0"
            )}
          >
            {children}
          </div>

          {/* mobile safe area */}
          {isMobile && <div className="pb-safe h-4" />}
        </div>
      </div>
    );
  };

  return { state: isOpen, open, close, Modal };
};

/* -------- Optional same-API helpers (unchanged) -------- */

const ModalTemplate = (
  name: string,
  {
    content,
    onClose,
  }: {
    content?: React.ReactNode;
    onClose?: () => void;
  }
) => {
  const { open, close, Modal } = useModal(name, { onClose });
  return forwardRef<
    ModalHandle,
    {
      children?: React.ReactNode;
      className?: string;
      backdropClassName?: string;
    }
  >((props, ref) => {
    useImperativeHandle(ref, () => ({ open, close }));
    return createElement(Modal, props, content);
  });
};

export const ModalComponent = ({
  children,
  ref,
}: {
  children?: React.ReactNode;
  ref?: Ref<ModalHandle | null>;
}) => {
  const M = ModalTemplate("IncompleteProfileModal", { content: children });
  return <M ref={ref} />;
};

export const useModalRef = () => useRef<ModalHandle | null>(null);
