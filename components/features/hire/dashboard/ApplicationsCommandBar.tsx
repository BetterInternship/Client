import { ActionItem } from "@/components/ui/action-item";
import { CommandMenu } from "@/components/ui/command-menu";
import { useAppContext } from "@/lib/ctx-app";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Trash, X } from "lucide-react";

interface ApplicationsCommandBarProps {
  visible: boolean,
  selectedCount: number,
  allVisibleSelected: boolean,
  someVisibleSelected: boolean,
  visibleApplicationsCount: number,
  statuses: ActionItem[],
  onUnselectAll: () => void,
  onSelectAll: () => void,
  onDelete: () => void,
  onStatusChange: () => void,
}

export function ApplicationsCommandBar({
  visible,
  selectedCount,
  allVisibleSelected,
  someVisibleSelected,
  visibleApplicationsCount,
  statuses,
  onUnselectAll,
  onSelectAll,
  onDelete,
  onStatusChange,
} : ApplicationsCommandBarProps) {
  const { isMobile } = useAppContext();

  return isMobile ? (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed bottom-4 z-[100] shadow-xl w-max overflow-hidden rounded-md"
            initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%" }}
            exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ left: "50%" }}
          >
            <CommandMenu
              buttonLayout="vertical"
              items={statuses}
            />
          </motion.div>
          <motion.div
            className="fixed top-20 z-[100] shadow-xl w-max mx-2 overflow-hidden rounded-md"
            initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%" }}
            exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ left: "50%" }}
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
                ],
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
  ) : (
    <AnimatePresence>
      {visible && (
        <>
        <motion.div
          className="fixed bottom-4 z-[100] shadow-xl w-max overflow-hidden rounded-0.33em"
          initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%", backdropFilter: "blur(50%)" }}
          exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ left: "50%" }}
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