import { Check, Star, Trash, X, FileQuestion } from "lucide-react";
import { LucideIcon } from "lucide-react";

type StatusIconProps = {
  icon: LucideIcon;
  destructive?: boolean;
};

export const statusIconMap = new Map<number, StatusIconProps>([
  [0, { icon: FileQuestion }],
  [2, { icon: Star }],
  [4, { icon: Check }],
  [6, { icon: X }],
  [7, { icon: Trash, destructive: true }],
]);
