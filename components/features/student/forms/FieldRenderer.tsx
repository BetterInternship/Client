/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-16 22:43:51
 * @ Modified time: 2026-01-02 18:38:36
 * @ Description:
 *
 * The field renderer 3000 automatically renders the correct field for the situation!
 */

"use client";

import {
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormInput,
  FormTextarea,
  TimeInputNative,
} from "@/components/EditForm";
import {
  AutocompleteTreeMulti,
  TreeOption,
} from "@/components/ui/autocomplete";
import { ClientField } from "@betterinternship/core/forms";

export const FieldRenderer = <T extends any[]>({
  field,
  value = "",
  onChange,
  error,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  onChange: (v: any) => void;
  error?: string;
  onBlur?: () => void;
  allValues?: Record<string, string>;
  isPhantom?: boolean;
}) => {
  // Placeholder or error
  const TooltipLabel = () => {
    if (error) return <p className="text-destructive mt-1 text-xs">{error}</p>;

    return null;
  };

  // Dropdown
  if (field.type === "dropdown") {
    return (
      <FieldRendererDropdown
        field={field}
        value={value}
        TooltipContent={TooltipLabel}
        onChange={onChange}
        onBlur={onBlur}
        isPhantom={isPhantom}
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
        onBlur={onBlur}
        isPhantom={isPhantom}
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
        onBlur={onBlur}
        isPhantom={isPhantom}
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
        onBlur={onBlur}
        isPhantom={isPhantom}
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
        onBlur={onBlur}
        isPhantom={isPhantom}
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
        onBlur={onBlur}
        isPhantom={isPhantom}
      />
    );
  }

  return (
    <FieldRendererInput
      field={field}
      value={value}
      TooltipContent={TooltipLabel}
      onChange={onChange}
      onBlur={onBlur}
      isPhantom={isPhantom}
    />
  );
};

/**
 * Badge component for phantom fields
 */
const PhantomFieldBadge = () => {
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 bg-amber-100 text-amber-500 rounded-[0.33em] whitespace-nowrap">
      Not in PDF
    </span>
  );
};

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
const FieldRendererDropdown = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string | number) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const options: Option[] = (field.options ?? []).map((o) => ({
    id: o as string,
    name: o as string,
  }));

  const badge = isPhantom && <PhantomFieldBadge />;

  return (
    <div className="space-y-1.5 relative overflow-visible">
      <FormDropdown
        required={false}
        label={field.label}
        value={value}
        options={options}
        setter={(v) => onChange(v)}
        className="w-full"
        tooltip={field.tooltip_label}
        onBlur={() => onBlur?.()}
        labelAddon={badge}
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
const FieldRendererDate = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: number) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  // Try to parse it first
  const numericalValue = isNaN(parseInt(value)) ? 0 : parseInt(value);

  const badge = isPhantom && <PhantomFieldBadge />;

  // By default the unix timestamp is 0 if it's not a number
  return (
    <div className="space-y-1.5">
      <FormDatePicker
        required={false}
        label={field.label}
        date={numericalValue}
        setter={(v) => {
          onChange(v ?? 0);
          onBlur?.();
        }}
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
        labelAddon={badge}
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
const FieldRendererTime = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const badge = isPhantom && <PhantomFieldBadge />;

  return (
    <div className="space-y-1.5">
      <TimeInputNative
        required={false}
        label={field.label}
        value={value}
        tooltip={field.tooltip_label}
        onChange={(v) => onChange(v ?? "")}
        onBlur={() => onBlur?.()}
        labelAddon={badge}
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Checkbox input
 *
 * @component
 */
const FieldRendererCheckbox = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: boolean) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const badge = isPhantom && <PhantomFieldBadge />;

  return (
    <div className="space-y-1.5">
      <FormCheckbox
        required={false}
        label={field.label}
        checked={!!value}
        tooltip={field.tooltip_label}
        sentence={field.tooltip_label}
        setter={(c: boolean) => onChange(c)}
        onBlur={() => onBlur?.()}
        labelAddon={badge}
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
const FieldRendererInput = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string | number) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const inputMode = field.type === "number" ? "numeric" : undefined;
  const badge = isPhantom && <PhantomFieldBadge />;

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
        onBlur={() => onBlur?.()}
        labelAddon={badge}
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
const FieldRendererTextarea = <T extends any[]>({
  field,
  value,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  value: string;
  TooltipContent: () => React.ReactNode;
  onChange: (v: string | number) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const badge = isPhantom && <PhantomFieldBadge />;

  return (
    <div className="space-y-1.5">
      <FormTextarea
        required={false}
        label={field.label}
        value={value ?? ""}
        setter={onChange}
        onBlur={() => onBlur?.()}
        tooltip={field.tooltip_label}
        className="w-full"
        labelAddon={badge}
      />
      <TooltipContent />
    </div>
  );
};

/**
 * Multiselect input
 *
 * @component
 */
const FieldRendererMultiselect = <T extends any[]>({
  field,
  values,
  options,
  TooltipContent,
  onChange,
  onBlur,
  isPhantom = false,
}: {
  field: ClientField<T>;
  values: string[];
  options: TreeOption[];
  TooltipContent: () => React.ReactNode;
  onChange: (v: string[]) => void;
  onBlur?: () => void;
  isPhantom?: boolean;
}) => {
  const badge = isPhantom && <PhantomFieldBadge />;

  return (
    <div className="space-y-1.5" onBlur={() => onBlur?.()}>
      <AutocompleteTreeMulti
        required={false}
        label={field.label}
        value={values ?? []}
        setter={onChange}
        className="w-full"
        tooltip={field.tooltip_label}
        tree={options}
        labelAddon={badge}
      />
      <TooltipContent />
    </div>
  );
};
