import { Button } from "@/components/ui/button";
import { CommandMenu } from "@/components/ui/command-menu";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/lib/ctx-app";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, X } from "lucide-react";

interface ApplicationsCommandBarProps {
  visible: boolean;
  selectedCount: number;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  visibleApplicationsCount: number;
  statuses: Array<DropdownMenuItem | string>;
  applicationVisibility: React.ReactNode[];
  onUnselectAll: () => void;
  onSelectAll: () => void;
}

export function ApplicationsCommandBar({
  visible,
  selectedCount,
  allVisibleSelected,
  statuses,
  applicationVisibility,
  onUnselectAll,
  onSelectAll,
}: ApplicationsCommandBarProps) {
  const { isMobile } = useAppContext();
  const statusItems = statuses.filter(
    (status): status is DropdownMenuItem => typeof status !== "string",
  );
  const statusMessage = statuses.find(
    (status): status is string => typeof status === "string",
  );
  const defaultStatusItem = statusItems[0] ?? { id: "0" };
  const selectAllLabel = allVisibleSelected ? "Unselect all" : "Select all";
  const SelectAllIcon = allVisibleSelected ? Square : CheckSquare;
  const renderStatusControl = (className?: string) =>
    statusItems.length > 0 ? (
      <DropdownMenu
        key="status-dropdown"
        className={className}
        items={statusItems}
        defaultItem={defaultStatusItem}
        placement="top"
        placeholder="Select Status"
      />
    ) : statusMessage ? (
      <span className="text-sm font-medium text-gray-700">{statusMessage}</span>
    ) : null;
  const mobileStatusControl = renderStatusControl(
    "h-9 w-full rounded-[0.33em]",
  );
  const desktopStatusControl = renderStatusControl("h-9 rounded-[0.33em]");

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className={
              isMobile
                ? "fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-gray-50 px-2 py-3 shadow-lg"
                : "fixed inset-x-3 bottom-3 z-[100] md:bottom-4"
            }
            initial={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "100%", filter: "blur(4px)", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {isMobile ? (
              <div
                role="toolbar"
                onClick={(e) => e.stopPropagation()}
                className="flex w-full flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <Button
                    key="cancel"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={onUnselectAll}
                  >
                    <X />
                  </Button>
                  {mobileStatusControl && (
                    <div className="min-w-0 flex-1">{mobileStatusControl}</div>
                  )}
                  <div className="flex shrink-0 items-center justify-center gap-1">
                    {applicationVisibility}
                  </div>
                </div>
              </div>
            ) : (
              <CommandMenu
                className="mx-auto rounded-[0.33em] shadow-lg md:w-fit"
                items={[
                  [
                    <Button
                      key="cancel"
                      variant="ghost"
                      size="icon"
                      onClick={onUnselectAll}
                    >
                      <X />
                    </Button>,
                    <span
                      key="selected-count"
                      className="text-sm font-medium text-gray-700"
                    >
                      {selectedCount} selected
                    </span>,
                    <Button
                      key="select-all"
                      variant="outline"
                      onClick={allVisibleSelected ? onUnselectAll : onSelectAll}
                      className="h-9 rounded-[0.33em]"
                    >
                      <SelectAllIcon />
                      <span>{selectAllLabel}</span>
                    </Button>,
                  ],
                  [desktopStatusControl, ...applicationVisibility],
                ]}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
