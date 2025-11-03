import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * A modal that pops up from the side of the window.
 *
 * @hook
 */
export const useSideModal = (
  name: string,
  options?: { onClose?: () => void }
) => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    open: () => setIsOpen(true),
    close: () => (setIsOpen(false), options?.onClose && options?.onClose()),
    SideModal: ({ children }: { children: React.ReactNode }) => {
      return (
        isOpen && (
          <div className="fixed inset-0 flex z-[100] bg-black/30 backdrop-blur-sm">
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
                  <ArrowLeft className="h-5 w-5" />
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
