/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-16 22:43:51
 * @ Modified time: 2025-10-31 16:18:44
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
  FormTextarea,
} from "@/components/EditForm";
import {
  AutocompleteTreeMulti,
  TreeOption,
} from "@/components/ui/autocomplete";
import { ClientField } from "@betterinternship/core/forms";
import { Info } from "lucide-react";

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
  const TooltipLabel = () => {
    if (showError && !!error)
      return <p className="text-xs text-destructive mt-1">{error}</p>;
    return <></>;
  };

  // Dropdown
  if (field.type === "dropdown") {
    return (
      <FieldRendererDropdown
        field={field}
        value={value}
        TooltipContent={TooltipLabel}
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
        TooltipContent={TooltipLabel}
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
        TooltipContent={TooltipLabel}
        onChange={onChange}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <FieldRendererTextarea
        field={field}
        value={value}
        TooltipContent={TooltipLabel}
        onChange={onChange}
      />
    );
  }

  if (field.type === "multiselect") {
    return (
      <FieldRendererMultiselect
        field={field}
        values={value.split("\n")}
        TooltipContent={TooltipLabel}
        onChange={(s) => onChange(s.join("\n"))}
        options={
          field.options?.map((o) => ({
            name: o as string,
            value: o as string,
          })) ?? []
        }
      />
    );
  }

  // Signatures or checkboxes
  if (field.type === "signature" || field.type === "checkbox") {
    return (
      <FieldRendererCheckbox
        field={field}
        value={value}
        TooltipContent={TooltipLabel}
        onChange={onChange}
      />
    );
  }

  return (
    <FieldRendererInput
      field={field}
      value={value}
      TooltipContent={TooltipLabel}
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
        tooltip={field.tooltip_label}
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
        tooltip={field.tooltip_label}
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
        tooltip={field.tooltip_label}
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
        tooltip={field.tooltip_label}
        sentence={field.tooltip_label}
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
  // const isRecipientField =
  //   typeof field.field === "string" && field.field.endsWith(":recipient");
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
        tooltip={field.tooltip_label}
        className="w-full"
      />
      {/* {isRecipientField && (
        <div className="flex gap-1 md:items-center">
          <Info className="text-primary h-3.5 w-3.5"></Info>
          <p className="text-xs text-primary">
            A separate form will be emailed to them to complete and sign.
          </p>
        </div>
      )} */}
      <TooltipContent />
    </div>
  );
};

/**
 * Textarea input
 *
 * @component
 */
const FieldRendererTextarea = ({
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
  return (
    <div className="space-y-1.5">
      <FormTextarea
        required={false}
        label={field.label}
        value={value ?? ""}
        setter={onChange}
        tooltip={field.tooltip_label}
        className="w-full"
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Textarea input
 *
 * @component
 */
const FieldRendererMultiselect = ({
  field,
  values,
  options,
  TooltipContent,
  onChange,
}: {
  field: ClientField<[]>;
  values: string[];
  options: TreeOption[];
  TooltipContent: () => React.ReactNode;
  onChange: (v: string[]) => void;
}) => {
  return (
    <div className="space-y-1.5">
      <AutocompleteTreeMulti
        required={false}
        label={field.label}
        value={values ?? []}
        setter={onChange}
        className="w-full"
        tooltip={field.tooltip_label}
        tree={options}
      />
      <TooltipContent />
    </div>
  );
};
