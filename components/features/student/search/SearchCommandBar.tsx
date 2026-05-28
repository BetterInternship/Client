import { useState, useEffect } from "react";
import { ActionItem } from "@/components/ui/action-item";
import { CommandMenu } from "@/components/ui/command-menu";
import { useAppContext } from "@/lib/ctx-app";
import { Job } from "@/lib/db/db.types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckSquare,
  Square,
  X,
  PanelRight,
  PanelRightClose,
  List,
} from "lucide-react";
import { useBlurTransition } from "@/components/animata/blur";
import { cn } from "@/lib/utils";

interface SearchCommandBarProps {
  visible: boolean;
  selected: Job[];
  selectedCount: number;
  onCancel: () => void;
  onUnselectPage: () => void;
  onSelectPage: () => void;
  onApply: () => void;
  onToggleSelect?: (job: Job) => void;
}

interface SelectedJobRowProps {
  job: Job;
  index: number;
  onToggleSelect?: (job: Job) => void;
}

function SelectedJobRow({ job, index, onToggleSelect }: SelectedJobRowProps) {
  const staggerDelay = index < 50 ? index * 0.05 : 0;
  const blurTransition = useBlurTransition({ delay: staggerDelay });

  return (
    <motion.div
      layout
      key={job.id}
      {...blurTransition}
      className="group flex items-center justify-between p-3 rounded-[0.33em] border border-gray-100 hover:border-gray-200"
    >
      <div className="flex-1 min-w-0 pr-3">
        <h4 className="font-heading font-medium text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
          {job.title}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {job.employer?.name || "Unknown Company"}
        </p>
      </div>
      {onToggleSelect && (
        <button
          type="button"
          onClick={() => onToggleSelect(job)}
          className="p-1 rounded hover:bg-muted text-muted-foreground  transition-all duration-200 shrink-0"
          aria-label="Remove job"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export function SearchCommandBar({
  visible,
  selected,
  selectedCount,
  onCancel,
  onUnselectPage,
  onSelectPage,
  onApply,
  onToggleSelect,
}: SearchCommandBarProps) {
  const { isMobile } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close sidebar if command bar becomes invisible or count goes to 0
  useEffect(() => {
    if (!visible || selectedCount === 0) {
      setIsOpen(false);
    }
  }, [visible, selectedCount]);

  const renderSidebar = () => (
    <motion.div
      className="fixed right-0 top-0 md:top-20 bottom-14 md:bottom-12 w-full md:max-w-sm bg-white border-l border-gray-200 flex flex-col overflow-hidden z-[110]"
      initial={{ x: "100%", filter: "blur(4px)", opacity: 0 }}
      animate={{ x: "0%", filter: "blur(0px)", opacity: 1 }}
      exit={{ x: "100%", filter: "blur(4px)", opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-muted/50">
        <div>
          <h3 className="font-heading font-semibold text-base">
            Selected Jobs
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedCount} listing{selectedCount !== 1 ? "s" : ""} selected
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-[0.33em] hover:bg-muted text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {selected.map((job, index) => (
          <SelectedJobRow
            key={job.id}
            job={job}
            index={index}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>{visible && isOpen && renderSidebar()}</AnimatePresence>

      {isMobile ? (
        <AnimatePresence>
          {visible && (
            <>
              <motion.div
                className="fixed left-0 bottom-0 z-[110] w-full"
                initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
                exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CommandMenu
                  buttonLayout="vertical"
                  items={[
                    [
                      `${selectedCount} selected`,
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
                        label: "Cancel",
                        icon: X,
                        onClick: onCancel,
                      },
                      {
                        id: "job_list",
                        label: "Selected jobs",
                        icon: List,
                        onClick: () => setIsOpen(!isOpen),
                        highlighted: isOpen,
                        highlightColor:
                          "bg-primary/10 text-primary font-semibold",
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
                className="fixed left-0 bottom-0 z-[110] w-full"
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
                    [
                      {
                        id: "job_list",
                        label: "Selected jobs",
                        icon: isOpen ? PanelRightClose : PanelRight,
                        onClick: () => setIsOpen(!isOpen),
                        highlighted: isOpen,
                        highlightColor: "bg-muted",
                      },
                    ],
                  ]}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
