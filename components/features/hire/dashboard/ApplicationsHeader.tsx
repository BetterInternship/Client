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

const test = (on: number) => {
    console.log(test, on);
}

export function ApplicationsHeader({
    selectedCount,
    onStatusChange
}: ApplicationsHeaderProps) {
    const { to_app_status_name } = useDbRefs();
    const { isMobile } = useAppContext();

    return isMobile ? (
        <>
            <StatusDropdown
                value={1}
                onChange={test}
                className="w-full"
            ></StatusDropdown>
        </>
    ) : (
        <div className="flex gap-2 pb-4">
            <FilterButton
                name="All"
                itemCount={selectedCount}
                isActive={true}
                onToggle={onStatusChange}
            />
            <FilterButton
                name="Starred"
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
            <FilterButton
                name="Deleted"
                itemCount={selectedCount}
                isActive={false}
                onToggle={onStatusChange}
            />
        </div>
    );
}