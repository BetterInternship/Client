import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils";

export const ActionButton = ({
  icon: Icon,
  label = "Button",
  onClick,
  enabled = true,
  destructive = false,
  size = 20,
} : {
  icon: LucideIcon;
  label?: string;
  onClick: (e: any) => void;
  enabled?: boolean;
  destructive?: boolean;
  size?: number;
}) => {
  return (
    <>
      <button
        data-destructive={destructive}
        disabled={!enabled}
        className="
          flex justify-center items-center p-2 transition rounded-sm
          enabled:data-[destructive=true]:hover:text-red-600
          enabled:data-[destructive=true]:hover:bg-destructive/25
          enabled:data-[destructive=false]:hover:bg-primary/25
          
          disabled:text-gray-500
          disabled:cursor-not-allowed
          disabled:hover:bg-transparent
        "
        onClick={onClick}
      >
        {Icon && <Icon size={size} />}
      </button>
    </>
  )
}