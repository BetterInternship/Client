import React from "react";
import { CheckIcon } from "lucide-react";

export const Timeline = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-1">{children}</div>;
};

interface TimelineItemProps {
  number: number;
  title: string | React.ReactNode;
  subtitle?: React.ReactNode;
  isLast?: boolean;
  children?: React.ReactNode;
}

export const TimelineItem = ({
  number,
  title,
  subtitle,
  isLast = false,
  children,
}: TimelineItemProps) => {
  const isCheckmark = number === -1;

  return (
    <div className="flex gap-2.5">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Circle or Checkmark */}
        {isCheckmark ? (
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
            {number}
          </div>
        )}
        {/* Line to next item */}
        {!isLast && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
          )}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
};
