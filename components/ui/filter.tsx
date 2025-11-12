import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * A button that can be set to filter a list by a given criteria on click.
 * @param name Name of filter displayed in the button.
 * @param itemCount (optional) Number of items that match the filtering criteria in the list.
 * @param className (optional) Custom styling.
 * @param isActive Boolean that controls the button's active state.
 * @param defaultActive The button's default state on load. This is false if not set.
 * @param onToggle A function that performs some action on the filter being toggled.
 * As an example, you might want to create a function to filter a list by some criteria and
 * use this button to trigger that.
 */
export const FilterButton = ({
  name,
  icon: Icon,
  itemCount,
  className,
  isActive,
  defaultActive = false,
  onToggle,
}: {
  name: string;
  itemCount?: number;
  icon?: LucideIcon;
  className?: string;
  isActive: boolean;
  defaultActive?: boolean;
  onToggle: (active: boolean) => void;
}) => {
  const [active, setActive] = useState<boolean>(defaultActive);
  const controlled = typeof isActive === "boolean";

  useEffect(() => {
    if (controlled) setActive(isActive);
  }, [isActive, controlled]);

  const handleClick = () => {
    const next = !active;
    if (!controlled) setActive(next);
    onToggle?.(next);
  };

  return (
    <button
      className={cn(
        "flex justify-center items-center px-2 py-1 gap-2 text-xs font-sans rounded-sm hover:bg-gray-200 text-gray-800 border-gray-200 border-[1px]",
        active
          ? "bg-primary text-primary-foreground hover:bg-primary"
          : "bg-white",
        className,
      )}
      aria-pressed={active}
      onClick={handleClick}
    >
      {Icon && <Icon size={16} />}
      <span>{name}</span>
      {/* Display the item count badge if one is given. */}
      {typeof itemCount === "number" && (
        <span
          className={cn(
            "flex justify-center items-center px-2 py-1 text-xs rounded-sm",
            active ? "text-primary-foreground" : "bg-slate-200 text-gray-800",
          )}
        >
          ({itemCount})
        </span>
      )}
    </button>
  );
};
