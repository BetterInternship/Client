/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-16 05:05:48
 * @ Modified time: 2025-07-01 13:58:39
 * @ Description:
 *
 * A collection of the icons we use for different indicators.
 */

import {
  Clipboard,
  Briefcase,
  Users2,
  Globe,
  Wifi,
  GraduationCap,
  Clock,
  PhilippinePeso,
  CheckCircle,
  XCircle,
  CircleCheck,
} from "lucide-react";

/**
 * Component for indicated job mode (face-to-face, hybrid, etc.)
 *
 * @component
 */
export const JobModeIcon = ({ mode }: { mode: number | null | undefined }) => {
  switch (mode) {
    case 0: // On site
      return <Users2 className="w-3 h-3 mr-1" />;
    case 1: // Hybrid
      return <Globe className="w-3 h-3 mr-1" />;
    case 2: // Remote
      return <Wifi className="w-3 h-3 mr-1" />;
  }

  // Not specified
  return <Briefcase className="w-3 h-3 mr-1" />;
};

/**
 * Returns the icon associated with the given job type.
 *
 * @component
 */
export const JobTypeIcon = ({ type }: { type: number | null | undefined }) => {
  switch (type) {
    case 0:
      return <GraduationCap className="w-3 h-3 mr-1" />;
    case 1:
      return <Clock className="w-3 h-3 mr-1" />;
    case 2:
      return <Briefcase className="w-3 h-3 mr-1" />;
  }

  // Not specified
  return <Clipboard className="w-3 h-3 mr-1" />;
};

/**
 * The icon we use for salaries
 *
 * @component
 */
export const SalaryIcon = () => {
  return <PhilippinePeso className="w-3 h-3 mr-1" />;
};

/**
 * Just so we can keep this consistent
 *
 * @component
 */
export const BooleanCheckIcon = ({ checked }: { checked?: boolean | null }) => {
  if (checked)
    return <CircleCheck className="w-[1.1em] h-[1.1em] mr-1"></CircleCheck>;
  else return <XCircle className="w-[1.1em] h-[1.1em] mr-1"></XCircle>;
};
