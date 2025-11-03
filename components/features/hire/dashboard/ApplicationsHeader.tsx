"use client";
import { useDbRefs } from "@/lib/db/use-refs";
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { useAppContext } from "@/lib/ctx-app";
import { FilterButton } from "@/components/ui/filter";

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

      return (
        <FilterButton
          key={key}
          name={name}
          itemCount={value}
          isActive={activeFilter === filterID}
          onToggle={() => onFilterChange(filterID)}
        />
      );
    });
  };

  return isMobile ? (
    <>
      <StatusDropdown
        value={1}
        onChange={() => onFilterChange(activeFilter)}
        className="w-full"
      />
    </>
  ) : (
    <div className="flex gap-2 pb-4">
      {allButton}
      {otherButtons()}
    </div>
  );
}
