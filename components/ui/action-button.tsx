import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipPortal,
} from "./tooltip";

export const ActionButton = ({
  icon: Icon,
  label = "Button",
  onClick,
  enabled = true,
  destructive = false,
  size = 20,
  notification = false,
}: {
  icon: LucideIcon;
  label?: string;
  onClick: (e: any) => void;
  enabled?: boolean;
  destructive?: boolean;
  size?: number;
  notification?: boolean;
}) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-destructive={destructive}
            disabled={!enabled}
            className="
              group
              relative
              flex justify-center items-center p-2 transition rounded-[0.33em]
              enabled:data-[destructive=true]:hover:text-destructive-foreground
              enabled:data-[destructive=true]:hover:bg-destructive
              enabled:data-[destructive=false]:hover:bg-muted

              disabled:text-gray-500
              disabled:cursor-not-allowed
              disabled:hover:bg-transparent
            "
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
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>{label}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>
  );
};
