import { cn } from "@/lib/utils";
import { useDbRefs } from "@/lib/db/use-refs";
import { DB_STATUS_MAP, UI_STATUS_MAP } from "@/lib/consts/application";
import { Button } from "./button";

interface StatusBadgeProps {
  statusId: number;
  className?: string;
}

export const getStatusFilterKey = (statusId: number) => {
  const config = DB_STATUS_MAP[statusId];
  return config?.key || "pending";
};

export const STATUS_COLOR_CLASSES: Record<string, string> = {
  all: "border-primary/30 bg-primary text-primary",
  pending: "border-warning/40 bg-warning/90 text-white",
  shortlisted: "border-blue-500/40 bg-blue-600/80 text-white",
  accepted: "border-supportive/40 bg-supportive/80 text-white",
  deleted: "border-destructive/40 bg-destructive/80 text-white",
  rejected: "border-destructive/40 bg-destructive/80 text-white",
  archived: "border-warning/40 bg-warning/80 text-white",
};

export const STATUS_HOVER_CLASSES: Record<string, string> = {
  all: "hover:bg-primary",
  pending: "hover:bg-warning",
  shortlisted: "hover:bg-blue-600",
  accepted: "hover:bg-supportive",
  deleted: "hover:bg-destructive",
  rejected: "hover:bg-destructive",
  archived: "hover:bg-warning",
};

export default function StatusBadge({ statusId, className }: StatusBadgeProps) {
  const filterKey = getStatusFilterKey(statusId);
  const status = UI_STATUS_MAP.get(filterKey);
  const { to_app_status_name } = useDbRefs();

  if (!status) {
    return null;
  }

  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "h-full w-full justify-start gap-3 border px-2 py-1",
        STATUS_COLOR_CLASSES[filterKey],
        className,
      )}
    >
      <span>
        <status.icon />
        {to_app_status_name(statusId)}
      </span>
    </Button>
  );
}
