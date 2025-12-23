"use client";

import { formatDateWithoutTime } from "@/lib/utils";
import { ClientBlock } from "@betterinternship/core/forms";
import { useEffect, useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { FieldPreview, useFormRendererContext } from "./form-renderer.ctx";
import { GenerateButtons } from "./GenerateFormButtons";
import {
  filterBlocks,
  getBlockField,
  isBlockField,
  seedValuesWithAutofill,
} from "./utils";

export function FormRenderer({
  formName,
  signingPartyId,
  blocks,
  values,
  setValues,
  autofillValues,
  onChange,
  errors = {},
  setPreviews,
  onBlurValidate,
  handleSubmit,
  busy,
  hasSignature,
}: {
  formName: string;
  signingPartyId?: string;
  blocks: ClientBlock<[]>[];
  values: Record<string, any>;
  autofillValues: Record<string, string>;
  errors?: Record<string, string>;
  setValues: (values: Record<string, string>) => void;
  onChange: (key: string, value: any) => void;
  setPreviews?: (previews: Record<number, React.ReactNode[]>) => void;
  onBlurValidate?: (fieldKey: string) => void;
  handleSubmit?: () => Promise<void>;
  busy?: boolean;
  hasSignature?: boolean;
}) {
  const form = useFormRendererContext();
  const filteredBlocks = filterBlocks(blocks, signingPartyId);
  const [selectedField, setSelectedField] = useState<string>("");

  // Seed from saved autofill
  useEffect(() => {
    if (!autofillValues) return;
    setValues(seedValuesWithAutofill(filteredBlocks, values, autofillValues));
  }, []);

  const refreshPreviews = () => {
    const filteredFields = filteredBlocks
      .map((block) => getBlockField(block))
      .filter((field) => !!field);

    const newPreviews: Record<number, React.ReactNode[]> = {};

    form.keyedFields
      .filter((kf) => filteredFields.find((f) => f.field === kf.field))
      .filter((kf) => kf.x && kf.y)
      .forEach((field) => {
        if (!newPreviews[field.page]) newPreviews[field.page] = [];
        const clientField = filteredFields.find((f) => f.field === field.field);
        let value = values[field.field] as string;

        // Map values appropriately for preview
        if (clientField?.type === "date")
          value = formatDateWithoutTime(
            new Date(parseInt(value || "0")).toISOString(),
          );

        newPreviews[field.page].push(
          <FieldPreview
            value={value}
            x={field.x}
            y={field.y}
            w={field.w}
            h={field.h}
            selected={field.field === selectedField}
            field={field.field}
          />,
        );
      });

    setPreviews?.(newPreviews);
  };

  // Refresh previews when fields change
  useEffect(() => {
    refreshPreviews();
  }, [form.keyedFields, values]);

  return (
    <div className="relative max-h-[100%] overflow-auto pb-8">
      <div className="sticky top-0 px-7 py-3 text-2xl font-bold tracking-tighter text-gray-700 text-opacity-60 bg-gray-100 border-b border-gray-300 z-[50] shadow-soft">
        {formName}
      </div>
      <div className="py-4"></div>
      <div className="space-y-3 px-7">
        <BlocksRenderer
          formKey={formName}
          blocks={filteredBlocks}
          values={values}
          onChange={onChange}
          errors={errors}
          setSelected={setSelectedField}
          onBlurValidate={onBlurValidate}
        />
      </div>
      {handleSubmit && (
        <div className="px-7 py-3">
          <GenerateButtons
            handleSubmit={handleSubmit}
            busy={busy}
            noEsign={!hasSignature}
          />
        </div>
      )}
    </div>
  );
}

const BlocksRenderer = ({
  formKey,
  blocks,
  values,
  onChange,
  errors,
  setSelected,
  onBlurValidate,
}: {
  formKey: string;
  blocks: ClientBlock<[]>[];
  values: Record<string, string>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  setSelected: (selected: string) => void;
  onBlurValidate?: (fieldKey: string) => void;
}) => {
  if (!blocks.length) return null;
  const sortedBlocks = blocks.toSorted((a, b) => a.order - b.order);
  return sortedBlocks.map((block) => {
    const field = getBlockField(block);
    return (
      <div
        className="space-between flex flex-row"
        key={`${formKey}:${block.text_content ?? JSON.stringify(block.field_schema)}`}
      >
        <div
          className="flex-1"
          onFocus={() => setSelected(block.field_schema?.field as string)}
        >
          {isBlockField(block) && (
            <FieldRenderer
              field={field}
              value={values[field.field]}
              onChange={(v) => onChange(field.field, v)}
              onBlur={() => onBlurValidate?.(field.field)}
              error={errors[field.field]}
              allValues={values}
            />
          )}
          {block.block_type === "header" && block.text_content && (
            <HeaderRenderer content={block.text_content} />
          )}
          {block.block_type === "paragraph" && block.text_content && (
            <ParagraphRenderer content={block.text_content} />
          )}
        </div>
      </div>
    );
  });
};
