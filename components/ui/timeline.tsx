import React from "react";

export const Timeline = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-1">{children}</div>;
};

interface TimelineItemProps {
  number: number;
  title: string;
  subtitle?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineItem = ({
  number,
  title,
  subtitle,
  isLast = false,
}: TimelineItemProps) => {
  return (
    <div className="flex gap-2.5">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Circle */}
        <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
          {number}
        </div>
        {/* Line to next item */}
        {!isLast && <div className="w-0.5 h-5 bg-gray-200 mt-0.5" />}
      </div>

      {/* Content */}
      <div className="pt-0.5 flex-1">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
