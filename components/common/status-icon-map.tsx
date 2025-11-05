import { Star, Trash, FileQuestion, CheckCircle2, XCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

type StatusIconProps = {
  icon: LucideIcon;
  destructive?: boolean;
};

/**
 * This maps applicant statuses to an icon and its 'destructive' label.
 * For example, the ID 2 is 'starred' as of the time of writing, 
 * so it corresponds to the 'Star' Lucide React icon.
 */
export const statusIconMap = new Map<number, StatusIconProps>([
  [0, { icon: FileQuestion }],
  [2, { icon: Star }],
  [4, { icon: CheckCircle2 }],
  [6, { icon: XCircle }],
  [7, { icon: Trash, destructive: true }],
]);
