"use client";

import { useEffect, useMemo, useRef } from "react";
import { ClientBlock } from "@betterinternship/core/forms";
import { FieldRenderer } from "./FieldRenderer";
import { RadioGroupFiller } from "./RadioGroupFiller";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { useFormRendererContext } from "./form-renderer.ctx";
import { getBlockField, isBlockField } from "./utils";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import { useProfileData } from "@/lib/api/student.data.api";
import { getFullName } from "@/lib/profile";
import { useSignContext } from "@/components/providers/sign.ctx";
import { formatTimestampDateWithoutTime } from "@/lib/utils";
import { withSavedSignatureImagesForFields } from "@/lib/saved-signature-image";
import { getSignatureImageFieldKey } from "@betterinternship/core/forms";

const getSignatureRecipientKey = (field: { signing_party_id?: string }) =>
  field.signing_party_id || "initiator";

const getCanonicalSignatureFields = (
  signatureFields: { field: string; signing_party_id?: string }[],
) => {
  const seenRecipientIds = new Set<string>();
  return signatureFields.filter((signatureField) => {
    const recipientKey = getSignatureRecipientKey(signatureField);
    if (seenRecipientIds.has(recipientKey)) return false;
    seenRecipientIds.add(recipientKey);
    return true;
  });
};

const getRadioGroupId = (block: ClientBlock<any[]>) => {
  const fieldSchema = block.field_schema as
    | { radio_group_id?: unknown }
    | undefined;

  return typeof fieldSchema?.radio_group_id === "string"
    ? fieldSchema.radio_group_id
    : undefined;
};

export function FormFillerRenderer({
  onValuesChange,
  onFieldSelect,
  selectionTick = 0,
  autoScrollToSelectedField = true,
}: {
  onValuesChange?: (values: Record<string, string>) => void;
  onFieldSelect?: (fieldId: string) => void;
  selectionTick?: number;
  autoScrollToSelectedField?: boolean;
}) {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const profile = useProfileData();
  const signContext = useSignContext();
  const autofillValues = useMyAutofill();
  const filteredBlocks = form.blocks;
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Deduplicate blocks: only keep first instance of each field ID.
  // Signatures are recipient-level inputs, so multiple placements for one signer
  // collapse into one list entry while still filling every matching signature field.
  const deduplicatedBlocks = useMemo(() => {
    const seenFieldIds = new Set<string>();
    const seenSignatureRecipientIds = new Set<string>();
    return filteredBlocks.filter((block) => {
      if (!isBlockField(block) && block.block_type !== "form_phantom_field")
        return true;
      const field = getBlockField(block) || block.phantom_field_schema;
      if (!field) return true;

      if (field.type === "signature") {
        const recipientKey = getSignatureRecipientKey(field);
        if (seenSignatureRecipientIds.has(recipientKey)) return false;
        seenSignatureRecipientIds.add(recipientKey);
      }

      if (seenFieldIds.has(field.field)) return false;
      seenFieldIds.add(field.field);
      return true;
    });
  }, [filteredBlocks]);

  const finalValues = useMemo(
    () => formFiller.getFinalValues(autofillValues),
    [formFiller, autofillValues],
  );

  // Strip signature image data — only text signatures are allowed
  const sanitizedValues = useMemo(() => {
    const cleaned = { ...finalValues };
    for (const key of Object.keys(cleaned)) {
      if (key.startsWith("__signatureImage:")) {
        delete cleaned[key];
      }
    }
    return cleaned;
  }, [finalValues]);

  // Clear any persisted signature image data from formFiller state on mount
  useEffect(() => {
    for (const key of Object.keys(formFiller.getFinalValues())) {
      if (key.startsWith("__signatureImage:")) {
        formFiller.setValue(key, "");
      }
    }
  }, []);
  const signatureFields = useMemo(
    () => form.formMetadata.getSignatureFieldsForClientService("initiator"),
    [form.formMetadata],
  );
  const signatureFieldKeys = useMemo(
    () =>
      getCanonicalSignatureFields(signatureFields).map(
        (signatureField) => signatureField.field,
      ),
    [signatureFields],
  );
  const signatureFieldKey = signatureFieldKeys.join("\n");
  const profileFullName = getFullName(profile.data);

  useEffect(() => {
    const valuesWithPrefilledSignatures =
      form.formMetadata.setSignatureValueForSigningParty(
        formFiller.getFinalValues(autofillValues),
        profileFullName,
        "initiator",
      );
    const valuesWithSavedSignatureImages = withSavedSignatureImagesForFields({
      values: valuesWithPrefilledSignatures,
      signatureFields,
      signatureImage: profile.data?.signatureImage,
    });

    // Strip signature image keys before initializing — only text signatures allowed
    const valuesToInitialize = { ...valuesWithSavedSignatureImages };
    for (const key of Object.keys(valuesToInitialize)) {
      if (key.startsWith("__signatureImage:")) {
        delete valuesToInitialize[key];
      }
    }

    formFiller.initializeValues(valuesToInitialize);
  }, [
    autofillValues,
    form.formMetadata,
    profile.data?.signatureImage,
    profileFullName,
    signatureFieldKey,
  ]);

  useEffect(() => {
    signContext.setRequiredSignatures(signatureFieldKeys);
  }, [signatureFieldKey]);

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

    Object.entries(values).forEach(([key, value]) => {
      // Skip signature image data — only text signatures are allowed
      if (key.startsWith("__signatureImage:")) return;
      // Find the field definition to check its type
      const field = form.fields.find((f) => f.field === key);

      // Only convert to date if it's actually a date field
      const numValue = Number(value);
      if (
        field?.type === "date" &&
        !isNaN(numValue) &&
        numValue > 1000000000 &&
        numValue < 999999999999999
      ) {
        formatted[key] = formatTimestampDateWithoutTime(numValue);
      } else {
        formatted[key] = String(value || "");
      }
    });

    return formatted;
  };

  // Notify parent of values change
  useEffect(() => {
    onValuesChange?.(formatValues(finalValues));
  }, [finalValues, onValuesChange]);

  // Scroll to selected field
  useEffect(() => {
    if (
      !autoScrollToSelectedField ||
      !form.selectedPreviewId ||
      !fieldRefs.current[form.selectedPreviewId] ||
      !scrollContainerRef.current
    )
      return;

    const fieldElement = fieldRefs.current[form.selectedPreviewId];
    const scrollContainer = scrollContainerRef.current;

    if (fieldElement && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const fieldRect = fieldElement.getBoundingClientRect();
      const isVisible =
        fieldRect.top >= containerRect.top &&
        fieldRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

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
  }, [autoScrollToSelectedField, form.selectedPreviewId, selectionTick]);

  // Scroll to first field with error
  useEffect(() => {
    const errorFields = Object.keys(formFiller.errors);
    if (errorFields.length === 0) return;

    const firstErrorField = errorFields[0];
    const firstFieldElement = fieldRefs.current[firstErrorField];

    if (firstFieldElement && scrollContainerRef.current) {
      // Scroll the first field into view
      firstFieldElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    // Add red background to ALL fields with errors
    errorFields.forEach((fieldKey) => {
      const fieldElement = fieldRefs.current[fieldKey];
      if (fieldElement) {
        fieldElement.classList.add("bg-red-100");
      }
    });

    // Auto-remove background after 2 seconds
    const timer = setTimeout(() => {
      errorFields.forEach((fieldKey) => {
        const fieldElement = fieldRefs.current[fieldKey];
        if (fieldElement) {
          fieldElement.classList.remove("bg-red-100");
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timer);
      errorFields.forEach((fieldKey) => {
        const fieldElement = fieldRefs.current[fieldKey];
        if (fieldElement) {
          fieldElement.classList.remove("bg-red-100");
        }
      });
    };
  }, [formFiller.errors]);

  return (
    <div className="relative h-full flex flex-col">
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-auto flex flex-col"
      >
        <div className="space-y-3 px-7 flex-1 mb-5">
          <BlocksRenderer
            formKey={form.formName}
            blocks={deduplicatedBlocks}
            values={sanitizedValues}
            onChange={formFiller.setValue}
            errors={formFiller.errors}
            setSelected={(fieldId) => {
              if (onFieldSelect) {
                onFieldSelect(fieldId);
                return;
              }
              form.setSelectedPreviewId(fieldId);
            }}
            onBlurValidate={(fieldKey, nextValue) => {
              // Before validating, sync form values to params so validators can access them
              const currentValues = formFiller.getFinalValues(autofillValues);
              const valuesForParams =
                nextValue === undefined
                  ? currentValues
                  : {
                      ...currentValues,
                      [fieldKey]:
                        nextValue === null || nextValue === undefined
                          ? ""
                          : typeof nextValue === "string" ||
                              typeof nextValue === "number" ||
                              typeof nextValue === "boolean"
                            ? String(nextValue)
                            : "",
                    };

              // Use form values directly as params (already in correct format)
              const mergedParams = { ...form.params, ...valuesForParams };

              // Update form renderer state (for future renders)
              form.updateFieldsWithParams(valuesForParams);

              // Recreate the field with merged params using formMetadata
              const fieldsWithMergedParams =
                form.formMetadata.getFieldsForClientService(
                  "initiator",
                  mergedParams,
                );
              const updatedField = fieldsWithMergedParams.find(
                (f) => f.field === fieldKey,
              );

              if (!updatedField) {
                console.warn(`Field ${fieldKey} not found in recreated fields`);
                return;
              }

              // Validate with the updated field that has fresh params
              formFiller.validateField(
                fieldKey,
                updatedField,
                autofillValues,
                nextValue,
              );
            }}
            fieldRefs={fieldRefs.current}
            selectedFieldId={form.selectedPreviewId}
          />
        </div>
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
  onBlurValidate?: (fieldKey: string, nextValue?: unknown) => void;
  fieldRefs: Record<string, HTMLDivElement | null>;
  selectedFieldId?: string;
}) => {
  const form = useFormRendererContext();
  if (!blocks.length) return null;
  const sortedBlocks = blocks.toSorted((a, b) => a.order - b.order);

  // Pre-compute radio groups so we can collapse them into a single dropdown
  const radioGroupMap = new Map<string, typeof sortedBlocks>();
  for (const block of sortedBlocks) {
    const groupId = getRadioGroupId(block);
    if (!groupId) continue;
    if (!radioGroupMap.has(groupId)) radioGroupMap.set(groupId, []);
    radioGroupMap.get(groupId)!.push(block);
  }
  const renderedRadioGroups = new Set<string>();

  return sortedBlocks.map((block, i) => {
    const isForm = isBlockField(block);
    const field = isForm ? getBlockField(block) : null;

    // Collapse all blocks in a radio group into a single dropdown
    const radioGroupId = getRadioGroupId(block);
    if (radioGroupId) {
      if (renderedRadioGroups.has(radioGroupId)) return null;
      renderedRadioGroups.add(radioGroupId);
      return (
        <div key={`radio-group-${radioGroupId}`}>
          <RadioGroupFiller
            blocks={radioGroupMap.get(radioGroupId)!}
            values={values}
            onChange={onChange}
            errors={errors}
            setSelected={setSelected}
            selectedFieldId={selectedFieldId}
            fieldRefs={fieldRefs}
          />
        </div>
      );
    }

    // Check if this is a phantom block
    const isPhantomBlock = block.block_type === "form_phantom_field";
    const phantomField = isPhantomBlock ? block.phantom_field_schema : null;

    // For phantom blocks, get field from phantom_field_schema
    const actualField = field || phantomField;
    const isPhantom = isPhantomBlock;

    const signatureFieldsForRecipient =
      actualField?.type === "signature"
        ? form.formMetadata
            .getSignatureFieldsForClientService(
              getSignatureRecipientKey(actualField),
            )
            .filter(
              (signatureField) =>
                getSignatureRecipientKey(signatureField) ===
                getSignatureRecipientKey(actualField),
            )
        : [];

    // Only check selection for form fields
    const isSelected =
      isForm &&
      actualField &&
      (selectedFieldId === actualField.field ||
        signatureFieldsForRecipient.some(
          (signatureField) => signatureField.field === selectedFieldId,
        ));
    const blockKey = `${formKey}:${actualField?.field || block.block_type}:${i}`;

    const handleFieldChange = (value: any) => {
      if (!actualField) return;
      if (!signatureFieldsForRecipient.length) {
        onChange(actualField.field, value);
        return;
      }

      for (const signatureField of signatureFieldsForRecipient) {
        onChange(signatureField.field, value);
      }
    };

    const handleAuxValueChange = (key: string, value: any) => {
      if (!signatureFieldsForRecipient.length) {
        onChange(key, value);
        return;
      }

      const signatureImageKeys = new Set(
        signatureFieldsForRecipient.map((signatureField) =>
          getSignatureImageFieldKey(signatureField.field),
        ),
      );
      if (!signatureImageKeys.has(key)) {
        onChange(key, value);
        return;
      }

      for (const signatureImageKey of signatureImageKeys) {
        onChange(signatureImageKey, value);
      }
    };

    return (
      <div key={blockKey}>
        {(isForm || isPhantomBlock) && actualField?.source === "manual" && (
          <>
            <div
              className="space-between flex flex-row"
              key={`${formKey}:${i}`}
            >
              <div
                ref={(el) => {
                  if (!el || !actualField) return;

                  fieldRefs[actualField.field] = el;
                  for (const signatureField of signatureFieldsForRecipient) {
                    fieldRefs[signatureField.field] = el;
                  }
                }}
                onClick={() => !isPhantom && setSelected(actualField?.field)}
                className={`flex-1 transition-all py-2 px-1 ${isPhantom ? "cursor-not-allowed" : "cursor-pointer"} ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 rounded-[0.33em]" : ""}`}
                onFocus={() => !isPhantom && setSelected(actualField?.field)}
                title={isPhantom ? "This field is not visible in the PDF" : ""}
              >
                <FieldRenderer
                  field={actualField}
                  value={values[actualField.field]}
                  onChange={handleFieldChange}
                  onAuxValueChange={handleAuxValueChange}
                  onBlur={(nextValue) =>
                    onBlurValidate?.(actualField.field, nextValue)
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
      </div>
    );
  });
};
