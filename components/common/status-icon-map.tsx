import { Star, Trash, FileQuestion, CheckCircle2, XCircle, Check, Ban, Archive } from "lucide-react";
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
  [0, { icon: FileQuestion, bgColor: "bg-orange-100", fgColor: "text-orange-900" }],
  [1, { icon: Star, bgColor: "bg-amber-100", fgColor: "text-amber-900" }],
  [4, { icon: Check, bgColor: "bg-green-100", fgColor: "text-green-900" }],
  [5, { icon: Trash, bgColor: "bg-stone-200", fgColor: "text-stone-900", destructive: true }],
  [6, { icon: Ban, bgColor: "bg-red-100", fgColor: "text-red-900" }],
  [7, { icon: Archive, bgColor: "bg-stone-200", fgColor: "text-stone-900" }],
]);
