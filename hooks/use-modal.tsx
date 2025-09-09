import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
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
import { useAppContext } from "@/lib/ctx-app";
import { useMobile } from "./use-mobile";
import React from "react";

interface IModalContext {}
const modalContext = createContext<IModalContext>({} as IModalContext);

/**
 * The interface exposed by the modal hook.
 *
 * @hook
 */
export type ModalHandle = {
  open: () => void;
  close: () => void;
};

/**
 * Wraps a modal component to expose functions that ancestors can call.
 *
 * @param name
 * @param onClose
 * @returns
 */
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
  return forwardRef<ModalHandle, { children?: React.ReactNode }>(
    (props, ref) => {
      useImperativeHandle(ref, () => ({
        open,
        close,
      }));
      return createElement(Modal, props, content);
    }
  );
};

/**
 * The actual Modal Component to instantiate.
 *
 * @component
 */
export const ModalComponent = ({
  children,
  ref,
}: {
  children?: React.ReactNode;
  ref?: Ref<ModalHandle | null>;
}) => {
  const ModalComponent = ModalTemplate("IncompleteProfileModal", {
    content: children,
  });

  return <ModalComponent ref={ref} />;
};

/**
 *@hook
 */
export const useModalRef = () => useRef<ModalHandle | null>(null);

/**
 * Creates a reusable modal component with robust mobile touch handling.
 *
 * @hook
 */
export const useModal = (
  name: string,
  options?: { onClose?: () => void; showCloseButton?: boolean }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showCloseButton = true } = options || {};
  const { isMobile } = useAppContext();
  const { isTouchOnSingleElement, isTouchEndOnElement, isSwipe } = useMobile();

  // Refs for touch event handling
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click handler for desktop
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only handle mouse events on desktop
      if (isMobile) return;

      if (e.target === backdropRef.current) setIsOpen(false);
    },
    [isMobile]
  );

  // Body scroll management
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Mobile viewport height handling
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
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen && options?.onClose) options?.onClose();
  }, [isOpen]);

  return {
    state: isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    Modal: ({
      children,
      className,
      backdropClassName,
    }: {
      children?: React.ReactNode;
      className?: string;
      backdropClassName?: string;
    }) => (
      <>
        {isOpen && (
          <div
            ref={backdropRef}
            className={`fixed inset-0 bg-black bg-opacity-50 flex z-[100] backdrop-blur-sm ${
              isMobile
                ? "items-end justify-center p-0"
                : "items-center justify-center p-4"
            } ${backdropClassName}`}
            onClick={handleBackdropClick}
            onTouchEnd={(e) => {
              if (
                !isSwipe() &&
                isTouchOnSingleElement() &&
                isTouchEndOnElement(backdropRef.current)
              )
                setIsOpen(false);
            }}
            style={{
              height: isMobile ? "calc(var(--vh, 1vh) * 100)" : "100vh",
            }}
          >
            <div
              ref={modalRef}
              className={`bg-white overflow-hidden shadow-2xl ${
                isMobile
                  ? "w-full max-w-full mx-0 rounded-t-sm rounded-b-none max-h-[85vh] min-h-[200px] flex flex-col animate-in slide-in-from-bottom duration-300"
                  : "max-w-2xl rounded-sm max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
              } ${className}`}
              style={{
                maxHeight: isMobile ? "calc(var(--vh, 1vh) * 85)" : "90vh",
                height: "auto",
              }}
            >
              {showCloseButton && (
                <div
                  className={`flex justify-end p-4 ${isMobile ? "pb-2" : ""}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors ${
                      isMobile ? "active:bg-gray-200" : ""
                    }`}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              )}
              <div
                className={`${
                  showCloseButton && isMobile ? "pt-0" : ""
                } flex-1 overflow-hidden`}
              >
                {children}
              </div>
              {/* Safe area padding for mobile */}
              {isMobile && <div className="pb-safe h-4" />}
            </div>
          </div>
        )}
      </>
    ),
  };
};
