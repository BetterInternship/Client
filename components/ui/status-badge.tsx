import { cn } from "@/lib/utils";
import { statusMap } from "../common/status-icon-map";
import { useDbRefs } from "@/lib/db/use-refs";

interface StatusBadgeProps {
  statusId : number;
}

export default function StatusBadge({
  statusId
} : StatusBadgeProps) {
  const status = statusMap.get(statusId);
  const { to_app_status_name } = useDbRefs();

  if (!status) {
    return null;
  }

  return (
    <div className={cn(
      "flex justify-center items-center gap-1 w-fit px-2 py-1 rounded-[0.33em] text-xs transition",
      status.bgColor,
      status.fgColor,
    )}>
      <status.icon className="h-3 w-3" />
      {to_app_status_name(statusId)}
    </div>
  )
}