/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-16 22:43:51
 * @ Modified time: 2025-10-30 21:11:54
 * @ Description:
 *
 * The field renderer 3000 automatically renders the correct field for the situation!
 */

"use client";

import {
  FormDropdown,
  FormDatePicker,
  TimeInputNative,
  FormInput,
  FormCheckbox,
} from "@/components/EditForm";
import { ClientField } from "@betterinternship/core/forms";

export function FieldRenderer({
  field,
  value = "",
  onChange,
  error,
  showError,
}: {
  field: ClientField<[]>;
  value: string;
  onChange: (v: any) => void;
  error?: string;
  showError?: boolean;
  allValues?: Record<string, string>;
}) {
  // Placeholder or error
  const Note = () => {
    if (showError && !!error)
      return <p className="text-xs text-rose-600 mt-1">{error}</p>;
    if (field.tooltip_label)
      return (
        <p className="text-xs text-muted-foreground mt-1">
          {field.tooltip_label}
        </p>
      );
    return <></>;
  };

  // Dropdown
  if (field.type === "dropdown") {
    return (
      <FieldRendererDropdown
        field={field}
        value={value}
        TooltipContent={Note}
        onChange={onChange}
      />
    );
  }

  // Date
  if (field.type === "date") {
    return (
      <FieldRendererDate
        field={field}
        value={value}
        TooltipContent={Note}
        onChange={onChange}
      />
    );
  }

  // Time
  if (field.type === "time") {
    return (
      <FieldRendererTime
        field={field}
        value={value}
        TooltipContent={Note}
        onChange={onChange}
      />
    );
  }

  // Signatures or checkboxes
  if (field.type === "signature" || field.type === "checkbox") {
    return (
      <FieldRendererCheckbox
        field={field}
        value={value}
        TooltipContent={Note}
        onChange={onChange}
      />
    );
  }

  return (
    <FieldRendererInput
      field={field}
      value={value}
      TooltipContent={Note}
      onChange={onChange}
    />
  );
}

// ! Probably migrate this in the future
interface Option {
  id: string;
  name: string;
}

/**
 * Dropdown
 *
 * @component
 */
const FieldRendererDropdown = ({
  field,
  value,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string | number) => void;
}) => {
  const options: Option[] = (field.options ?? []).map((o) => ({
    id: o as string,
    name: o as string,
  }));

  return (
    <div className="space-y-1.5">
      <FormDropdown
        required={false}
        label={field.label}
        value={value}
        options={options}
        setter={(v) => onChange(v)}
        className="w-full"
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Date input
 *
 * @component
 */
const FieldRendererDate = ({
  field,
  value,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: number) => void;
}) => {
  // Try to parse it first
  const numericalValue = isNaN(parseInt(value)) ? 0 : parseInt(value);

  // By default the unix timestamp is 0 if it's not a number
  return (
    <div className="space-y-1.5">
      <FormDatePicker
        required={false}
        label={field.label}
        date={numericalValue}
        setter={(v) => onChange(v ?? 0)}
        className="w-full"
        contentClassName="z-[1100]"
        placeholder="Select date"
        autoClose
        disabledDays={[]}
        format={(d) =>
          d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        }
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Time input
 *
 * @component
 */
const FieldRendererTime = ({
  field,
  value,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="space-y-1.5">
      <TimeInputNative
        required={false}
        label={field.label}
        value={value}
        onChange={(v) => onChange(v ?? "")}
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Time input
 *
 * @component
 */
const FieldRendererCheckbox = ({
  field,
  value,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: boolean) => void;
}) => {
  return (
    <div className="space-y-1.5">
      <FormCheckbox
        required={false}
        label={field.label}
        checked={!!value}
        setter={(c) => onChange(c)}
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Generic input
 *
 * @component
 */
const FieldRendererInput = ({
  field,
  value,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string | number) => void;
}) => {
  const inputMode = field.type === "number" ? "numeric" : undefined;
  return (
    <div className="space-y-1.5">
      <FormInput
        required={false}
        label={field.label}
        value={value ?? ""}
        setter={(v) => {
          if (inputMode !== "numeric") return onChange(v);
          const next = v.trim() === "" ? 0 : parseInt(v);
          if (!isNaN(next)) onChange(next);
        }}
        inputMode={inputMode}
        className="w-full"
      />
      <TooltipContent />
    </div>
  );
};
