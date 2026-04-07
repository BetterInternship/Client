import { cn } from "@/lib/utils";
import { useDbRefs } from "@/lib/db/use-refs";
import { DB_STATUS_MAP, UI_STATUS_MAP } from "@/lib/consts/application";

interface StatusBadgeProps {
  statusId: number;
}

export default function StatusBadge({ statusId }: StatusBadgeProps) {
  const config = DB_STATUS_MAP[statusId];
  const filterKey = config?.key || "pending";
  const status = UI_STATUS_MAP.get(filterKey);
  const { to_app_status_name } = useDbRefs();

  if (!status) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex justify-center items-center gap-1 w-full px-2 py-1 rounded-[0.33em] text-xs transition",
        status.bgColor,
        status.fgColor,
      )}
    >
      <status.icon className="h-3 w-3" />
      {to_app_status_name(statusId)}
    </div>
  );
}
