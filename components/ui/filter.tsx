import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const FilterButton = ({
    name,
    itemCount,
    className,
    isActive,
    defaultActive = false,
    onToggle,
}: {
    name: string;
    itemCount?: number;
    className?: string;
    isActive?: boolean;
    defaultActive?: boolean;
    onToggle: (active: boolean) => void;
}) => {
    const [active, setActive] = useState<boolean>(defaultActive);
    const controlled = typeof isActive === "boolean";

    useEffect(() => {
        if (controlled) setActive(isActive!);
    }, [isActive, controlled]);

    const handleClick = () => {
        const next = !active;
        if (!controlled) setActive(next);
        onToggle?.(next);
    };

    return (
        <button
            className={cn(
                "flex justify-center items-center px-2 py-1 gap-2 text-sm font-sans rounded-sm hover:bg-gray-200 text-gray-800 border-gray-300 border-2",
                active ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-white",
                className
            )}
            aria-pressed={active}
            onClick={handleClick}
        >
            <span>{name}</span>
            {typeof itemCount === "number" && (
                <span className={cn(
                    "px-2 py-1 text-sm rounded-sm",
                    active ? "text-primary-foreground" : "bg-slate-200 text-gray-800"
                )}>(
                    {itemCount})
                </span>
            )}
        </button>
    );
};