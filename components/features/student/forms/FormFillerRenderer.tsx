"use client";

import { useEffect, useMemo, useRef } from "react";
import { ClientBlock } from "@betterinternship/core/forms";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { useFormRendererContext } from "./form-renderer.ctx";
import { FormActionButtons } from "./FormActionButtons";
import { getBlockField, isBlockField } from "./utils";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import { useProfileData } from "@/lib/api/student.data.api";
import { getFullName } from "@/lib/profile";
import { useSignContext } from "@/components/providers/sign.ctx";
import { formatTimestampDateWithoutTime } from "@/lib/utils";

export function FormFillerRenderer({
  onValuesChange,
}: {
  onValuesChange?: (values: Record<string, string>) => void;
}) {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const profile = useProfileData();
  const signContext = useSignContext();
  const autofillValues = useMyAutofill();
  const filteredBlocks = form.blocks;
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Deduplicate blocks: only keep first instance of each field ID
  const deduplicatedBlocks = useMemo(() => {
    const seenFieldIds = new Set<string>();
    return filteredBlocks.filter((block) => {
      if (!isBlockField(block) && block.block_type !== "form_phantom_field")
        return true;
      const field = getBlockField(block) || block.phantom_field_schema;
      if (!field) return true;

      if (seenFieldIds.has(field.field)) return false;
      seenFieldIds.add(field.field);
      return true;
    });
  }, [filteredBlocks]);

  const finalValues = useMemo(
    () => formFiller.getFinalValues(autofillValues),
    [formFiller, autofillValues],
  );

  useEffect(() => {
    const signatureFields =
      form.formMetadata.getSignatureFieldsForClientService("initiator");
    const valuesWithPrefilledSignatures =
      form.formMetadata.setSignatureValueForSigningParty(
        finalValues,
        getFullName(profile.data),
        "initiator",
      );

    formFiller.setValues(valuesWithPrefilledSignatures);
    signContext.setRequiredSignatures(
      signatureFields.map((signatureField) => signatureField.field),
    );
  }, [form]);

  // Initialize form values whenever form changes or profile loads
  useEffect(() => {
    formFiller.resetErrors();

    // Wait for form metadata to load
    if (!form.fields || form.fields.length === 0) {
      return;
    }

    // Wait for profile data to load
    if (!profile.data?.id) {
      return;
    }

    // Load autofill or prefiller values for each field
    const defaultValues: Record<string, any> = {};

    form.fields.forEach((field) => {
      const autofillValue = autofillValues[field.field];

      // Priority: Autofill > Prefiller > Empty
      if (autofillValue) {
        const stringValue = String(autofillValue).trim();
        if (stringValue.length > 0) {
          defaultValues[field.field] = stringValue;
        }
      } else if (field.prefiller && typeof field.prefiller === "function") {
        try {
          const prefillerValue = field.prefiller({ user: profile.data });
          if (prefillerValue !== null && prefillerValue !== undefined) {
            const stringValue = String(prefillerValue).trim();
            if (stringValue.length > 0) {
              defaultValues[field.field] = stringValue;
            }
          }
        } catch (err) {
          console.error(`Error calling prefiller for ${field.field}:`, err);
        }
      }
    });

    if (Object.keys(defaultValues).length > 0) {
      formFiller.initializeValues(defaultValues);
    }
  }, [form.formName, form.fields.length, profile.data]);

  const formatValues = (values: Record<string, any>) => {
    const formatted: Record<string, string> = {};

    console.log("formatValues called with: ", values);
    Object.entries(values).forEach(([key, value]) => {
      // unix timestamp to string
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 1000000000 && numValue < 999999999999999) {
        formatted[key] = formatTimestampDateWithoutTime(numValue);
      } else {
        formatted[key] = String(value || "");
      }
      
    });
    
    console.log("formatValues returning: ", formatted);
    return formatted;
  };

  // Notify parent of values change
  useEffect(() => {
    onValuesChange?.(formatValues(finalValues));
  }, [finalValues, onValuesChange]);

  // Scroll to selected field
  useEffect(() => {
    if (!form.selectedPreviewId || !fieldRefs.current[form.selectedPreviewId])
      return;

    const fieldElement = fieldRefs.current[form.selectedPreviewId];
    const scrollContainer = scrollContainerRef.current;

    if (fieldElement && scrollContainer) {
      // Scroll the field into view with a small padding
      fieldElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // Add a highlight animation
      fieldElement.classList.add(
        "ring-2",
        "ring-blue-400",
        "ring-offset-2",
        "rounded",
      );
      setTimeout(() => {
        fieldElement.classList.remove(
          "ring-2",
          "ring-blue-400",
          "ring-offset-2",
          "rounded",
        );
      }, 1500);
    }
  }, [form.selectedPreviewId]);

  return (
    <div className="relative h-full flex flex-col">
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-auto flex flex-col"
      >
        <div className="px-7 py-3 text-2xl font-bold tracking-tighter text-gray-700 text-opacity-60 bg-gray-100 border-b shadow-soft border-r border-gray-300">
          {form.formName}
        </div>
        <div className="space-y-2 px-7 border-r border-gray-300 flex-1 mb-5">
          <BlocksRenderer
            formKey={form.formName}
            blocks={deduplicatedBlocks}
            values={finalValues}
            onChange={formFiller.setValue}
            errors={formFiller.errors}
            setSelected={form.setSelectedPreviewId}
            onBlurValidate={(fieldKey, field) =>
              formFiller.validateField(fieldKey, field, autofillValues)
            }
            fieldRefs={fieldRefs.current}
            selectedFieldId={form.selectedPreviewId}
          />
        </div>
      </div>
      <div className="p-3 bg-gray-100 border-t border-r border-gray-300">
        <FormActionButtons />
      </div>
    </div>
  );
}

const BlocksRenderer = <T extends any[]>({
  formKey,
  blocks,
  values,
  onChange,
  errors,
  setSelected,
  onBlurValidate,
  fieldRefs,
  selectedFieldId,
}: {
  formKey: string;
  blocks: ClientBlock<T>[];
  values: Record<string, string>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  setSelected: (selected: string) => void;
  onBlurValidate?: (fieldKey: string, field: any) => void;
  fieldRefs: Record<string, HTMLDivElement | null>;
  selectedFieldId?: string;
}) => {
  if (!blocks.length) return null;
  const sortedBlocks = blocks.toSorted((a, b) => a.order - b.order);
  return sortedBlocks.map((block, i) => {
    const isForm = isBlockField(block);
    const field = isForm ? getBlockField(block) : null;

    // Check if this is a phantom block
    const isPhantomBlock = block.block_type === "form_phantom_field";
    const phantomField = isPhantomBlock ? block.phantom_field_schema : null;

    // For phantom blocks, get field from phantom_field_schema
    const actualField = field || phantomField;
    const isPhantom = isPhantomBlock;

    // Only check selection for form fields
    const isSelected = isForm && field && selectedFieldId === field.field;

    return (
      <>
        {(isForm || isPhantomBlock) && actualField?.source === "manual" && (
          <>
            <div
              className="space-between flex flex-row"
              key={`${formKey}:${i}`}
            >
              <div
                ref={(el) => {
                  if (el && actualField) fieldRefs[actualField.field] = el;
                }}
                onClick={() => !isPhantom && setSelected(actualField?.field)}
                className={`flex-1 transition-all py-2 px-1 ${isPhantom ? "cursor-not-allowed" : "cursor-pointer"} ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 rounded-[0.33em]" : ""}`}
                onFocus={() => !isPhantom && setSelected(actualField?.field)}
                title={isPhantom ? "This field is not visible in the PDF" : ""}
              >
                <FieldRenderer
                  field={actualField}
                  value={values[actualField.field]}
                  onChange={(v) => onChange(actualField.field, v)}
                  onBlur={() =>
                    onBlurValidate?.(actualField.field, actualField)
                  }
                  error={errors[actualField.field]}
                  allValues={values}
                  isPhantom={isPhantom}
                />
              </div>
            </div>
          </>
        )}
        {block.block_type === "header" && block.text_content && (
          <div className="flex flex-row">
            <HeaderRenderer content={block.text_content} />
          </div>
        )}
        {block.block_type === "paragraph" && block.text_content && (
          <div className="flex flex-row">
            <ParagraphRenderer content={block.text_content} />
          </div>
        )}
      </>
    );
  });
};
