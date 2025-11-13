import { Star, Trash, FileQuestion, CheckCircle2, XCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

type StatusProps = {
  icon: LucideIcon;
  bgColor: string;
  fgColor: string;
  destructive?: boolean;
};

/**
 * This maps applicant statuses to an icon, its color and its 'destructive' label.
 * For example, the ID 2 is 'starred' as of the time of writing, 
 * so it corresponds to the 'Star' Lucide React icon.
 */
export const statusMap = new Map<number, StatusProps>([
  [0, { icon: FileQuestion, bgColor: "bg-danger", fgColor: "text-white" }],
  [2, { icon: Star, bgColor: "bg-warning", fgColor: "text-white" }],
  [4, { icon: CheckCircle2, bgColor: "bg-supportive", fgColor: "text-white" }],
  [6, { icon: XCircle, bgColor: "bg-destructive", fgColor: "text-white" }],
  [7, { icon: Trash, bgColor: "bg-muted", fgColor: "text-stone-800", destructive: true }],
]);
