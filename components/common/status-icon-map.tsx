import { Check, Star, Trash, X } from "lucide-react";
import { ElementType } from "react";

type StatusIconProps = {
  icon: ElementType;
  destructive?: boolean;
};

export const statusIconMap: Record<number, StatusIconProps> = {
  1: { icon: Star },
  4: { icon: Check },
  6: { icon: X },
  7: { icon: Trash, destructive: true },
};
