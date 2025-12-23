"use client";

import { ClientBlock } from "@betterinternship/core/forms";
import { useEffect } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { useFormRendererContext } from "./form-renderer.ctx";
import { GenerateButtons } from "./GenerateFormButtons";
import {
  filterBlocks,
  getBlockField,
  isBlockField,
  seedValuesWithAutofill,
} from "./utils";

export function FormRenderer({
  signingPartyId,
  values,
  setValues,
  autofillValues,
  onChange,
  errors = {},
  onBlurValidate,
  handleSubmit,
  busy,
  hasSignature,
}: {
  signingPartyId?: string;
  values: Record<string, any>;
  autofillValues: Record<string, string>;
  errors?: Record<string, string>;
  setValues: (values: Record<string, string>) => void;
  onChange: (key: string, value: any) => void;
  onBlurValidate?: (fieldKey: string) => void;
  handleSubmit?: () => Promise<void>;
  busy?: boolean;
  hasSignature?: boolean;
}) {
  const form = useFormRendererContext();
  const filteredBlocks = filterBlocks(form.blocks, signingPartyId);

  // Seed from saved autofill
  useEffect(() => {
    if (!autofillValues) return;
    setValues(seedValuesWithAutofill(filteredBlocks, values, autofillValues));
  }, []);

  return (
    <div className="relative max-h-[100%] overflow-auto pb-8">
      <div className="sticky top-0 px-7 py-3 text-2xl font-bold tracking-tighter text-gray-700 text-opacity-60 bg-gray-100 border-b border-gray-300 z-[50] shadow-soft">
        {form.formName}
      </div>
      <div className="py-4"></div>
      <div className="space-y-3 px-7">
        <BlocksRenderer
          formKey={form.formName}
          blocks={filteredBlocks}
          values={values}
          onChange={onChange}
          errors={errors}
          setSelected={form.setSelectedPreviewId}
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
