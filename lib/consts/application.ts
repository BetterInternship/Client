// contains translation maps and types between db application states and human-readable frontend states.
import { Star, Trash, Check, Ban, Archive, Clock, List } from "lucide-react";
import { LucideIcon } from "lucide-react";

// track filters available to the dashboard.
export type ApplicationFilter =
  | "all"
  | "pending"
  | "accepted"
  | "shortlisted"
  | "rejected"
  | "archived";

// actions that can be performed on an application.
export type ApplicationAction =
  | "ACCEPT"
  | "REJECT"
  | "ARCHIVE"
  | "UNARCHIVE"
  | "SHORTLIST"
  | "DELETE"
  | "CHANGE_STATUS"
  | "NONE";

// icon map for actions/filters.
type StatusProps = {
  icon: LucideIcon;
  bgColor: string;
  fgColor: string;
  destructive?: boolean;
};

/**
 * This maps the dashboard's filter to an icon, its color and its 'destructive' label.
 * For example, the "shortlisted" filter corresponds to the "Star" icon.
 */
export const UI_STATUS_MAP = new Map<string, StatusProps>([
  [
    "all",
    {
      icon: List,
      bgColor: "bg-primary",
      fgColor: "text-primary-fg",
    },
  ],
  [
    "pending",
    {
      icon: Clock,
      bgColor: "bg-orange-700/10",
      fgColor: "text-orange-700",
    },
  ],
  [
    "shortlisted",
    { icon: Star, bgColor: "bg-amber-700/10", fgColor: "text-amber-700" },
  ],
  [
    "accepted",
    { icon: Check, bgColor: "bg-green-700/10", fgColor: "text-green-700" },
  ],
  [
    "deleted",
    {
      icon: Trash,
      bgColor: "bg-stone-700/10",
      fgColor: "text-stone-700",
      destructive: true,
    },
  ],
  [
    "rejected",
    { icon: Ban, bgColor: "bg-red-700/10", fgColor: "text-red-700" },
  ],
  [
    "archived",
    { icon: Archive, bgColor: "bg-stone-700/10", fgColor: "text-stone-700" },
  ],
]);

// map from filters to actions
interface StatusConfig {
  key?: ApplicationFilter;
  action?: ApplicationAction;
}

export const DB_STATUS_MAP: Record<number, StatusConfig> = {
  0: { key: "pending" },
  1: { key: "shortlisted", action: "SHORTLIST" },
  4: { key: "accepted", action: "ACCEPT" },
  5: { action: "DELETE" },
  6: { key: "rejected", action: "REJECT" },
  7: { key: "archived", action: "ARCHIVE" },
};
