import { LucideIcon } from "lucide-react";
import { cn } from "@betterinternship/components";

export const ActionButton = ({
  icon: Icon,
  label = "Button",
  onClick,
  enabled = true,
  destructive = false,
  size = 20,
  notification = false,
  className,
}: {
  icon: LucideIcon;
  label?: string;
  onClick: (e: any) => void;
  enabled?: boolean;
  destructive?: boolean;
  size?: number;
  notification?: boolean;
  className?: string;
}) => {
  return (
    <>
      <button
        data-destructive={destructive}
        disabled={!enabled}
        aria-label={label}
        className={cn(
          "group relative flex items-center justify-center rounded-[0.33em] p-2 transition enabled:data-[destructive=true]:hover:bg-destructive/25 enabled:data-[destructive=true]:hover:text-red-600 enabled:data-[destructive=false]:hover:bg-primary/25 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-transparent",
          className,
        )}
        onClick={onClick}
      >
        {notification && (
          <div
            className="absolute top-2 right-2 h-2 w-2 z-10 bg-primary rounded-full outline
            odd:outline-white
            even:outline-gray-50
            group-hover:outline-0
          "
          ></div>
        )}
        {Icon && <Icon size={size} />}
      </button>
    </>
  );
};
