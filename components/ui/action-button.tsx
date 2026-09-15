import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ActionButton = ({
  icon: Icon,
  label,
  disabledLabel,
  onClick,
  enabled = true,
  destructive = false,
  size = 20,
  notification = false,
}: {
  icon: LucideIcon;
  label?: string;
  /** Tooltip shown while disabled; falls back to `label` when omitted. */
  disabledLabel?: string;
  onClick: (e: any) => void;
  enabled?: boolean;
  destructive?: boolean;
  size?: number;
  notification?: boolean;
}) => {
  const button = (
    <button
      data-destructive={destructive}
      disabled={!enabled}
      className="
        group
        relative
        flex justify-center items-center p-2 transition rounded-[0.33em]
        enabled:cursor-pointer
        enabled:data-[destructive=true]:hover:text-red-600
        enabled:data-[destructive=true]:hover:bg-destructive/25
        enabled:data-[destructive=false]:hover:bg-primary/25

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
  );

  const tooltip = enabled ? label : (disabledLabel ?? label);
  if (!tooltip) return button;

  return (
    <Tooltip>
      {/* A disabled <button> swallows pointer events, so the trigger needs a wrapping span to still fire on hover. */}
      <TooltipTrigger asChild>
        <span
          className={enabled ? "inline-flex" : "inline-flex cursor-not-allowed"}
        >
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
