"use client";

import { ClientBlock, isFieldRequired } from "@betterinternship/core/forms";

type Props<T extends any[]> = {
  blocks: ClientBlock<T>[];
  values: Record<string, string>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  setSelected: (fieldId: string) => void;
  selectedFieldId?: string | null;
  fieldRefs: Record<string, HTMLDivElement | null>;
};

export function RadioGroupFiller<T extends any[]>({
  blocks,
  values,
  onChange,
  errors,
  setSelected,
  selectedFieldId,
  fieldRefs,
}: Props<T>) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const groupLabel =
    sortedBlocks[0]?.field_schema?.label ||
    sortedBlocks[0]?.field_schema?.field ||
    "";
  const required = sortedBlocks[0]?.field_schema
    ? isFieldRequired(sortedBlocks[0].field_schema)
    : false;

  const options = sortedBlocks.map((block) => ({
    fieldKey: block.field_schema!.field,
    label: block.field_schema?.radio_option_label || block.field_schema!.field,
  }));

  const selectedKey =
    options.find((o) => values[o.fieldKey] === "X")?.fieldKey ?? "";
  const representativeKey = options[0]?.fieldKey ?? "";
  const error = options.map((o) => errors[o.fieldKey]).find(Boolean);
  const isSelected = options.some((o) => o.fieldKey === selectedFieldId);

  const handleChange = (selectedFieldKey: string) => {
    for (const opt of options) {
      onChange(opt.fieldKey, opt.fieldKey === selectedFieldKey ? "X" : "");
    }
  };

  return (
    <div
      ref={(el) => {
        if (el && representativeKey) fieldRefs[representativeKey] = el;
      }}
      onClick={() => setSelected(representativeKey)}
      className={`cursor-pointer px-1 py-2 transition-all ${isSelected ? "rounded-[0.33em] ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      <div className="space-y-1.5">
        {groupLabel && (
          <label className="text-sm font-medium text-gray-700">
            {groupLabel} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedKey}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.fieldKey} value={opt.fieldKey}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
