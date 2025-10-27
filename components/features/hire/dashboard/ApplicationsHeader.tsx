"use client";
import { useDbRefs } from "@/lib/db/use-refs";
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { Button } from "@/components/ui/button";
import { EmployerApplication } from "@/lib/db/db.types";
import { useAppContext } from "@/lib/ctx-app";
import { FilterButton } from "@/components/ui/filter";

interface ApplicationsHeaderProps {
    selectedCount: number;
    onStatusChange: (active: boolean) => void;
}

export function ApplicationsHeader({
    selectedCount,
    onStatusChange
}: ApplicationsHeaderProps) {
    const { to_app_status_name } = useDbRefs();
    const { isMobile } = useAppContext();

    return isMobile ? (
        <></>
    ) : (
        <div className="flex gap-2 pb-4">
            <FilterButton
                name="All"
                itemCount={selectedCount}
                isActive={true}
                onToggle={onStatusChange}
            />
            <FilterButton
                name="Shortlisted"
                itemCount={selectedCount}
                isActive={false}
                onToggle={onStatusChange}
            />
            <FilterButton
                name="Hired"
                itemCount={selectedCount}
                isActive={false}
                onToggle={onStatusChange}
            />
            <FilterButton
                name="Rejected"
                itemCount={selectedCount}
                isActive={false}
                onToggle={onStatusChange}
            />
        </div>
    );
}