import React from "react";
import { CheckIcon, MailWarningIcon } from "lucide-react";
import { type } from "../../.next/types/routes";
import { Badge } from "./badge";

export const Timeline = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-1">{children}</div>;
};

interface TimelineItemProps {
  number: number;
  title: string | React.ReactNode;
  subtitle?: React.ReactNode;
  isLast?: boolean;
  children?: React.ReactNode;
  fromMe?: boolean;
  isMe?: boolean;
}

export const TimelineItem = ({
  number,
  title,
  subtitle,
  isLast = false,
  children,
  fromMe,
  isMe,
}: TimelineItemProps) => {
  const isCheckmark = number === -1;
  const isExclamation = fromMe;

  return (
    <div className="flex flex-start gap-2.5">
      <div className="flex flex-col items-center mt-1">
        {isCheckmark ? (
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        ) : isExclamation ? (
          <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
            <MailWarningIcon className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
            {number}
          </div>
        )}
        {!isLast && <div className="w-0.5 h-6 bg-gray-200 mt-0.5" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-between gap-2">
        <div className="flex-1 mt-1">
          <div className="flex flex-row items-center gap-2">
            {fromMe ? (
              <div className="text-sm font-semibold text-primary">{title}</div>
            ) : (
              <div className="text-sm text-gray-700">{title}</div>
            )}
            {isMe && <Badge type="primary">You</Badge>}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mb-1.5">{subtitle}</div>
          )}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
};
