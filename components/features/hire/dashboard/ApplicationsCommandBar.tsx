import { ActionItem } from "@/components/ui/action-item";
import { CommandMenu } from "@/components/ui/command-menu";
import { useAppContext } from "@/lib/ctx-app";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, X } from "lucide-react";

interface ApplicationsCommandBarProps {
  visible: boolean;
  selectedCount: number;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  visibleApplicationsCount: number;
  statuses: ActionItem[];
  applicationVisibility: ActionItem[];
  onUnselectAll: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}

export function ApplicationsCommandBar({
  visible,
  selectedCount,
  statuses,
  applicationVisibility,
  onUnselectAll,
  onSelectAll,
}: ApplicationsCommandBarProps) {
  const { isMobile } = useAppContext();

  return isMobile ? (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed left-0 bottom-0 z-[100] shadow-xl w-full overflow-hidden rounded-0.33em"
            initial={{ y: "100%", filter: "blur(4px)" }}
            animate={{ y: "0%", filter: "blur(0px)" }}
            exit={{ y: "100%", filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CommandMenu
              buttonLayout="vertical"
              items={statuses}
              className="w-full"
            />
          </motion.div>
          <motion.div
            className="fixed left-0 top-0 z-[100] w-full overflow-hidden"
            initial={{ y: "-100%", filter: "blur(4px)" }}
            animate={{ y: "0%", filter: "blur(0px)" }}
            exit={{ y: "-100%", filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CommandMenu
              buttonLayout="vertical"
              items={[
                [
                  {
                    id: "cancel",
                    icon: X,
                    onClick: onUnselectAll,
                  },
                  `${selectedCount} selected`,
                  {
                    id: "select_all",
                    label: "Select all",
                    icon: CheckSquare,
                    onClick: onSelectAll,
                  },
                ],
              ]}
              className="w-full justify-between"
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
            initial={{ y: "100%", filter: "blur(4px)" }}
            animate={{ y: "0%", filter: "blur(0px)" }}
            exit={{ y: "100%", filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CommandMenu
              items={[
                [
                  {
                    id: "cancel",
                    icon: X,
                    onClick: onUnselectAll,
                  },
                  `${selectedCount} selected`,
                ],
                statuses,
                applicationVisibility,
                [
                  {
                    id: "select_all",
                    label: "Select all",
                    icon: CheckSquare,
                    onClick: onSelectAll,
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
