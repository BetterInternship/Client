/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-17 22:06:11
 * @ Modified time: 2025-07-09 13:19:49
 * @ Description:
 *
 * Commonly used label components
 * All of them must have the value prop
 */

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, CircleX } from "lucide-react";
import React from "react";

const DEFAULT_LABEL = "Not specified";
type OptionalString = string | null | undefined;
type ValueComponentProps = {
  value?: OptionalString;
  fallback?: OptionalString;
  className?: OptionalString;
};
type ValueLinkComponentProps = {
  name?: OptionalString;
  value?: OptionalString;
  fallback?: OptionalString;
  className?: OptionalString;
};
type LabeledComponentProps = {
  label?: OptionalString;
  name?: OptionalString;
  value?: OptionalString;
  fallback?: OptionalString;
  className?: OptionalString;
};
export type ValueComponent = React.FC<ValueComponentProps>;
export type LabeledComponent = React.FC<LabeledComponentProps>;

/**
 * Displays links on profile page
 *
 * @component
 */
export const LinkLabel: ValueComponent = ({
  value,
}: ValueLinkComponentProps) => {
  return (
    <div>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm"
        >
          {"Link"}
        </a>
      ) : (
        <span className="text-gray-400 italic text-sm">{DEFAULT_LABEL}</span>
      )}
    </div>
  );
};

/**
 * Used in job details
 *
 * @component
 */
export const Property: ValueComponent = ({
  value,
  fallback,
  className = "",
}: ValueComponentProps) => {
  return (
    <div
      className={cn(
        "text-gray-700 font-semibold overflow-hidden text-ellipsis",
        className,
      )}
    >
      {value?.split("\n")?.map((v) => <div>{v}</div>) || (
        <span className="text-gray-400 italic">
          {fallback ?? DEFAULT_LABEL}
        </span>
      )}
    </div>
  );
};

export const LabeledProperty: LabeledComponent = ({
  label,
  value,
  fallback,
}: LabeledComponentProps) => {
  return (
    <div>
      <label className="text-xs text-gray-600  mb-1 block">{label}</label>
      <Property value={value} fallback={fallback} />
    </div>
  );
};

/**
 * Used in job details
 * // ! REMOVE THIS AND REPLACE WITH BOOLBADGE
 *
 * @component
 */
export const JobBooleanLabel: ValueComponent = ({
  value,
  fallback,
}: ValueComponentProps) => {
  return (
    <p className="text-gray-500 font-medium text-sm">
      {!["", "false", "null", "undefined"].includes(
        value?.toString().trim() ?? "",
      ) ? (
        <CheckCircle className="w-5 h-5 text-blue-500"></CheckCircle>
      ) : (
        <CircleX className="w-5 h-5 text-grey-500"></CircleX>
      )}
    </p>
  );
};

/**
 * Used in job details as titles
 *
 * @component
 */
export const JobTitleLabel: ValueComponent = ({
  value,
  fallback,
}: ValueComponentProps) => {
  return (
    <p className="text-gray-900 font-heading font-bold text-4xl line-clamp-2 truncate break-words whitespace-pre-wrap">
      {value || (
        <span className="text-gray-400 italic">
          {fallback ?? DEFAULT_LABEL}
        </span>
      )}
    </p>
  );
};

/**
 * Used in employer profile page
 *
 * @component
 */
export const EmployerPropertyLabel: ValueComponent = ({
  value,
  fallback,
}: ValueComponentProps) => {
  return (
    <p className="text-gray-700 font-medium text-sm overflow-hidden text-ellipsis">
      {value || (
        <span className="text-gray-400 font-normal italic">
          {fallback ?? DEFAULT_LABEL}
        </span>
      )}
    </p>
  );
};

export const ErrorLabel: ValueComponent = ({ value, fallback }) => {
  return value ? (
    <div className="flex items-center gap-1 text-destructive text-xs m-1">
      <AlertCircle className="h-3 w-3" />
      <span>{value ?? fallback}</span>
    </div>
  ) : (
    <></>
  );
};
