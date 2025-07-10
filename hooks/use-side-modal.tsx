import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * A modal that pops up from the side of the window.
 *
 * @hook
 */
export const useSideModal = (name: string) => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    SideModal: ({ children }: { children: React.ReactNode }) => {
      return (
        isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex z-[100] backdrop-blur-sm">
            <div className="absolute right-0 w-1/3 h-full bg-white">
              <div className="relative w-full p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
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
