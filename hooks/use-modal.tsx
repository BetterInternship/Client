"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useImperativeHandle,
  forwardRef,
  createElement,
  Ref,
} from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { useMobile } from "./use-mobile";
import { cn } from "@/lib/utils";

interface IModalContext {}
const modalContext = createContext<IModalContext>({} as IModalContext);

/**
 * The interface exposed by the modal hook.
 */
export type ModalHandle = {
  open: () => void;
  close: () => void;
};

/**
 * Creates a reusable modal with robust mobile behavior.
 * - Locks body scroll when open
 * - Fixes iOS 100vh with --vh
 * - Desktop click-outside to close
 * - Mobile touch close on backdrop
 * - Accepts `className` for panel sizing and `backdropClassName` for wrapper
 */
export const useModal = (
  name: string,
  options?: { onClose?: () => void; showCloseButton?: boolean }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showCloseButton = true } = options || {};
  const { isMobile } = useAppContext();
  const { isTouchOnSingleElement, isTouchEndOnElement, isSwipe } = useMobile();

  // Refs
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Desktop: close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      if (e.target === backdropRef.current) setIsOpen(false);
    },
    [isMobile]
  );

  // Body scroll lock + iOS --vh fix
  useEffect(() => {
    if (!isOpen) return;

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
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.removeProperty("--vh");
        window.removeEventListener("resize", setVH);
        window.removeEventListener("orientationchange", setVH);
      };
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile]);

  // Fire onClose callback after closing
  useEffect(() => {
    if (!isOpen && options?.onClose) options.onClose();
  }, [isOpen]);

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

    return (
      <div
        ref={backdropRef}
        className={cn(
          "fixed inset-0 bg-black/50 flex z-[100] backdrop-blur-sm",
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
              ? "w-full max-w-full mx-0 rounded-t-sm rounded-b-none h-[85vh] min-h-[200px] animate-in slide-in-from-bottom duration-300"
              : "w-full max-w-2xl rounded-sm h-[90vh] animate-in fade-in zoom-in-95 duration-200",
            className
          )}
        >
          {showCloseButton && (
            <div className={cn("flex justify-end p-4", isMobile && "pb-2")}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                onTouchEnd={(e) => {
                  e.stopPropagation();
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

          {/* Give children a solid scroll container */}
          <div
            className={cn(
              showCloseButton && isMobile ? "pt-0" : "",
              "flex-1 overflow-hidden h-full min-h-0"
            )}
          >
            {children}
          </div>

          {/* Mobile safe area padding */}
          {isMobile && <div className="pb-safe h-4" />}
        </div>
      </div>
    );
  };

  return {
    state: isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    Modal,
  };
};

/* ---------- Optional helpers, kept for API parity ---------- */

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

/**
 * The actual Modal Component to instantiate (if you need a ready-made one).
 */
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

/**
 * Small helper to create a ref you can pass down to ModalComponent.
 */
export const useModalRef = () => useRef<ModalHandle | null>(null);
