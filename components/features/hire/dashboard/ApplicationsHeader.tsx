"use client";
import { useDbRefs } from "@/lib/db/use-refs";
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { useAppContext } from "@/lib/ctx-app";
import { FilterButton } from "@/components/ui/filter";

interface ApplicationsHeaderProps {
    selectedCounts?: number[];
    activeFilter: number;
    onFilterChange: (filter: number) => void;
}

export function ApplicationsHeader({
    selectedCounts = [0, 0, 0, 0, 0],
    activeFilter,
    onFilterChange,
}: ApplicationsHeaderProps) {
    const { to_app_status_name } = useDbRefs();
    const { isMobile } = useAppContext();

    console.log(selectedCounts);

    return isMobile ? (
        <>
            <StatusDropdown
                value={1}
                onChange={() => onFilterChange(activeFilter)}
                className="w-full"
            ></StatusDropdown>
        </>
    ) : (
        <div className="flex gap-2 pb-4">
            <FilterButton
                name="All"
                itemCount={selectedCounts[0]}
                isActive={activeFilter === -1}
                onToggle={() => onFilterChange(-1)}
            />
            <FilterButton
                name="Starred"
                itemCount={selectedCounts[2]}
                isActive={activeFilter === 4}
                onToggle={() => onFilterChange(4)}
            />
            <FilterButton
                name="Hired"
                itemCount={selectedCounts[1]}
                isActive={activeFilter === 1}
                onToggle={() => onFilterChange(1)}
            />
            <FilterButton
                name="Rejected"
                itemCount={selectedCounts[3]}
                isActive={activeFilter === 6}
                onToggle={() => onFilterChange(6)}
            />
            <FilterButton
                name="Deleted"
                itemCount={selectedCounts[4]}
                isActive={activeFilter === 7}
                onToggle={() => onFilterChange(7)}
            />
        </div>
    );
}