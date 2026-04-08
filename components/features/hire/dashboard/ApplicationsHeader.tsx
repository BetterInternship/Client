"use client";
import { useAppContext } from "@/lib/ctx-app";
import { FilterButton } from "@/components/ui/filter";
import { UI_STATUS_MAP } from "@/lib/consts/application";
import { ApplicationFilter } from "@/lib/consts/application";

interface ApplicationsHeaderProps {
  selectedCounts: Record<ApplicationFilter | number, number>;
  activeFilter: ApplicationFilter;
  onFilterChange: (filter: ApplicationFilter) => void;
}

export function ApplicationsHeader({
  selectedCounts,
  activeFilter,
  onFilterChange,
}: ApplicationsHeaderProps) {
  const { isMobile } = useAppContext();

  const filterButtons = () => {
    const orderedFilters: ApplicationFilter[] = [
      "all",
      "pending",
      "shortlisted",
      "accepted",
      "rejected",
      "archived",
    ];

    return orderedFilters.map((filterKey) => {
      const appsCount = selectedCounts[filterKey];
      const name = filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
      const icon = UI_STATUS_MAP.get(filterKey)?.icon;

      if (appsCount === 0) return null;
      return (
        <FilterButton
          key={filterKey}
          name={name}
          icon={icon}
          itemCount={appsCount}
          isActive={activeFilter === filterKey}
          onToggle={() => onFilterChange(filterKey)}
        />
      );
    });
  };

  return isMobile ? (
    <div className="flex items-center">
      <div
        className="flex items-center gap-2 w-full overflow-x-scroll
                 [mask-image:_linear-gradient(to_right,black_80%,transparent)]"
      >
        {filterButtons()}
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">{filterButtons()}</div>
  );
}
