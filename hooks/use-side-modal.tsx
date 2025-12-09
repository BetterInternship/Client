import { ArrowLeft } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/ctx-app";

/**
 * A modal that pops up from the side of the window.
 *
 * @hook
 */
export const useSideModal = (
  name: string,
  options?: { onClose?: () => void,
    allowBackdropClick?: boolean
   }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const { allowBackdropClick = true } = options || {};
  const { isMobile } = useAppContext();

  const backdropRef = useRef<HTMLDivElement>(null);
  const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (!allowBackdropClick) return;
        if (isMobile) return;
        if (e.target === backdropRef.current) {
          console.debug(`[useModal:${name}] backdrop click -> close`);
          setIsOpen(false);
        }
      },
      [isMobile, name, allowBackdropClick]
    );

  return {
    open: () => setIsOpen(true),
    close: () => (setIsOpen(false), options?.onClose && options?.onClose()),
    SideModal: ({ children }: { children: React.ReactNode }) => {
      return (
        isOpen && (
          <div 
          className="fixed inset-0 flex z-[100] bg-black/30 backdrop-blur-sm"
          ref={backdropRef}
          onClick={handleBackdropClick}
          >
            <div className="absolute right-0 lg:w-1/3 w-full h-full bg-white">
              <div className="relative w-full p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (
                    setIsOpen(false), options?.onClose && options?.onClose()
                  )}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="h-8 w-8" />
                </Button>
              </div>
              {children}
            </div>
          </div>
        )
      );
    },
  };
};