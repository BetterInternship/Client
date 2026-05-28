import { ActionItem } from "@/components/ui/action-item";
import { CommandMenu } from "@/components/ui/command-menu";
import { useAppContext } from "@/lib/ctx-app";
import { Job } from "@/lib/db/db.types";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckSquare, Square, X } from "lucide-react";

interface SearchCommandBarProps {
  visible: boolean;
  selected: Job[];
  selectedCount: number;
  onCancel: () => void;
  onUnselectPage: () => void;
  onSelectPage: () => void;
  onApply: () => void;
}

export function SearchCommandBar({
  visible,
  selected,
  selectedCount,
  onCancel,
  onUnselectPage,
  onSelectPage,
  onApply,
}: SearchCommandBarProps) {
  const { isMobile } = useAppContext();

  return isMobile ? (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed left-0 bottom-0 z-[100] w-full"
            initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CommandMenu
              buttonLayout="vertical"
              items={[
                [`${selectedCount} selected`],
                [
                  {
                    id: "apply",
                    label: `Apply (${selectedCount})`,
                    icon: Check,
                    onClick: onApply,
                    bgColor: "bg-primary/10",
                    fgColor: "text-primary",
                  },
                  {
                    id: "cancel",
                    label: `Cancel`,
                    icon: X,
                    onClick: onCancel,
                  },
                ],
              ]}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ) : (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed left-0 bottom-0 z-[100] w-full"
            initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CommandMenu
              items={[
                [
                  {
                    id: "cancel",
                    icon: X,
                    onClick: onCancel,
                  },
                  `${selectedCount} selected`,
                ],
                [
                  {
                    id: "select_all",
                    label: "Select all",
                    icon: CheckSquare,
                    onClick: onSelectPage,
                  },
                  {
                    id: "unselect_all",
                    label: "Unselect all",
                    icon: Square,
                    onClick: onUnselectPage,
                  },
                ],
                [
                  {
                    id: "apply",
                    label: `Apply (${selectedCount})`,
                    icon: Check,
                    onClick: onApply,
                    bgColor: "bg-primary/10",
                    fgColor: "text-primary",
                  },
                ],
              ]}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
