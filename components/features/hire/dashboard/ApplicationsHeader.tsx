"use client";
import { useDbRefs } from "@/lib/db/use-refs";
import { useAppContext } from "@/lib/ctx-app";
import { FilterButton } from "@/components/ui/filter";
import { statusMap } from "@/components/common/status-icon-map";
import { List } from "lucide-react";

interface ApplicationsHeaderProps {
  selectedCounts: Record<string | number, number>;
  activeFilter: number;
  onFilterChange: (filter: number) => void;
}

export function ApplicationsHeader({
  selectedCounts,
  activeFilter,
  onFilterChange,
}: ApplicationsHeaderProps) {
  const { isMobile } = useAppContext();
  const { get_app_status } = useDbRefs();

  const { all, ...otherCounts } = selectedCounts;

  const allButton = (
    <FilterButton
      key="all"
      name="All"
      itemCount={all || 0}
      icon={List}
      isActive={activeFilter === -1}
      onToggle={() => onFilterChange(-1)}
    />
  );

  const otherButtons = () => {
    return Object.entries(otherCounts).map(([key, value]) => {
      let name: string;
      let filterID: number;

      if (key === "all") {
        name = "All";
        filterID = -1;
      } else {
        const numericKey = parseInt(key, 10);
        name = get_app_status(numericKey)?.name || key;
        filterID = numericKey;
      }

      if (value !== 0) {
        return (
          <FilterButton
            key={key}
            name={name}
            icon={statusMap.get(filterID)?.icon}
            itemCount={value}
            isActive={activeFilter === filterID}
            onToggle={() => onFilterChange(filterID)}
          />
        );
      }
    });
  };

  return isMobile ? (
    <div className="flex items-center">
      <div className="flex items-center gap-2 w-full overflow-x-scroll
                 [mask-image:_linear-gradient(to_right,black_80%,transparent)]">
        {allButton}
        {otherButtons()}
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">
      {allButton}
      {otherButtons()}
    </div>
  );
}
