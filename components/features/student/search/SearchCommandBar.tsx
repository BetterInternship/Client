import { useState, useEffect } from "react";
import { CommandMenu } from "@/components/ui/command-menu";
import { Button } from "@/components/ui/button";
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
      className="fixed right-3 top-3 bottom-0 z-[110] flex w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[0.33em] border border-gray-200 bg-white shadow-lg md:top-24 md:bottom-20 md:max-w-sm"
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

      {/* Mobile bottom bar */}
      {isMobile ? (
        <AnimatePresence>
          {visible && (
            <>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[110] border-t border-gray-200 bg-gray-50 px-2 py-3 shadow-lg"
                initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
                exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CommandMenu
                  className="w-full border-0 bg-transparent px-0 py-0 shadow-none"
                  items={[
                    [
                      <Button
                        key="cancel"
                        variant="ghost"
                        size="icon"
                        onClick={onCancel}
                      >
                        <X />
                      </Button>,
                      <Button
                        key="job-list"
                        variant="outline"
                        onClick={() => setIsOpen(!isOpen)}
                        className={"h-10" + (isOpen ? " bg-muted" : "")}
                      >
                        <List />
                        <span>Open Selected Jobs ({selectedCount})</span>
                      </Button>,
                      <Button
                        key="apply"
                        size="sm"
                        scheme="primary"
                        onClick={onApply}
                        className={"h-10"}
                      >
                        Apply ({selectedCount})
                      </Button>,
                    ],
                  ]}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : (
        // Desktop bottom bar
        <AnimatePresence>
          {visible && (
            <>
              <motion.div
                className="fixed inset-x-3 bottom-3 z-[110] md:bottom-4"
                initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
                exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CommandMenu
                  className="mx-auto rounded-[0.33em] shadow-lg md:w-fit"
                  items={[
                    [
                      <Button
                        key="cancel"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                      >
                        <X />
                      </Button>,
                      <Button
                        key="select-all"
                        variant="outline"
                        size="sm"
                        onClick={onSelectPage}
                      >
                        <CheckSquare />
                        <span>Select all</span>
                      </Button>,
                      <Button
                        key="unselect-all"
                        variant="outline"
                        size="sm"
                        onClick={onUnselectPage}
                      >
                        <Square />
                        <span>Unselect all</span>
                      </Button>,
                    ],

                    [
                      <Button
                        key="job-list"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                        className={isOpen ? "bg-muted" : ""}
                      >
                        {isOpen ? <PanelRightClose /> : <PanelRight />}
                        <span>Selected jobs</span>
                      </Button>,
                    ],
                    [
                      <Button
                        key="apply"
                        size="sm"
                        scheme="primary"
                        onClick={onApply}
                      >
                        <Check />
                        <span>Apply ({selectedCount})</span>
                      </Button>,
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
