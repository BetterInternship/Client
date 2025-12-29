"use client";

import { ClientBlock } from "@betterinternship/core/forms";
import { useEffect, useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { useFormRendererContext } from "./form-renderer.ctx";
import { GenerateFormButtons } from "./generate-form-button";
import {
  filterBlocks,
  getBlockField,
  isBlockField,
  seedValuesWithAutofill,
  validateField,
} from "./utils";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useProfileData } from "@/lib/api/student.data.api";
import { Button } from "@/components/ui/button";
import { FormService } from "@/lib/api/services";
import { useProfileActions } from "@/lib/api/student.actions.api";

// ! move this
type FormErrors = Record<string, string>;

export function FormRenderer({
  signingPartyId,
  values,
  setValues,
  autofillValues,
  onChange,
  onBlurValidate,
  hasSignature,
}: {
  signingPartyId?: string;
  values: Record<string, any>;
  autofillValues: Record<string, string>;
  setValues: (values: Record<string, string>) => void;
  onChange: (key: string, value: any) => void;
  onBlurValidate?: (fieldKey: string) => void;
  hasSignature?: boolean;
}) {
  const form = useFormRendererContext();
  const formMetdata = form.formMetadata ?? null;
  const fields = formMetdata?.getFieldsForClientService() ?? [];
  const filteredBlocks = filterBlocks(form.blocks, signingPartyId);
  const profile = useProfileData();
  const { update } = useProfileActions();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

  /**
   * This submits the form to the server
   * @param withEsign - if true, enables e-sign; if false, does prefill
   * @param _bypassConfirm - internal flag to skip recipient confirmation on re-call
   * @returns
   */
  const handleSubmit = async (withEsign?: boolean, _bypassConfirm = false) => {
    setSubmitted(true);
    if (!profile.data?.id) return;

    // Validate fields before allowing to proceed
    const finalValues = { ...autofillValues, ...values };
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const error = validateField(field, values, autofillValues ?? {});
      if (error) errors[field.field] = error;
    }

    // If any errors, disallow proceed
    setErrors(errors);
    if (Object.keys(errors).length) return;

    // Find recipient fields (keys ending with ':recipient')
    const recipientEmails = fields
      .filter(
        (f) => typeof f.field === "string" && f.field.endsWith(":recipient"),
      )
      .map((f) => (finalValues[f.field] as string)?.trim())
      .filter(Boolean);

    if (recipientEmails.length > 0 && withEsign && !_bypassConfirm) {
      const recipientFields = fields
        .filter(
          (f) => typeof f.field === "string" && f.field.endsWith(":recipient"),
        )
        .map((f) => ({
          field: f.field,
          label: f.label,
          email: (finalValues[f.field] as string)?.trim(),
        }))
        .filter((r) => r.email);

      openGlobalModal(
        "confirm-recipients",
        <div>
          <p className="mt-2 text-sm text-gray-600 text-justify">
            We will email the following recipients a separate form to complete
            and sign. Please double-check these addresses before continuing.
          </p>

          <ul className="mt-4 max-h-40 overflow-auto divide-y">
            {recipientFields.map((e, i) => (
              <li
                key={i}
                className="py-2 text-sm flex gap-1 items-center overflow-hidden"
              >
                <div className="font-medium text-primary truncate">
                  {e.email}
                </div>
                <div className="text-gray-500 whitespace-nowrap">
                  - {e.label}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => closeGlobalModal("confirm-recipients")}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeGlobalModal("confirm-recipients");
                void handleSubmit(true, true);
              }}
              type="button"
            >
              Confirm & Send
            </Button>
          </div>
        </div>,
        { title: "Confirm recipients" },
      );

      return;
    }

    // proceed to save + submit
    try {
      setBusy(true);

      const internshipMoaFieldsToSave: Record<
        string,
        Record<string, string>
      > = {
        shared: {},
      };

      // Save it per field or shared
      for (const field of fields) {
        if (field.shared) {
          internshipMoaFieldsToSave.shared[field.field] = finalValues[
            field.field
          ] as string;
        } else {
          if (!internshipMoaFieldsToSave[form.formName])
            internshipMoaFieldsToSave[form.formName] = {};
          internshipMoaFieldsToSave[form.formName][field.field] = finalValues[
            field.field
          ] as string;
        }
      }

      // Save for future use
      await update.mutateAsync({
        internship_moa_fields: internshipMoaFieldsToSave,
      });

      // Generate form
      await FormService.requestGenerateForm({
        formName: form.formName,
        formVersion: form.formVersion,
        values: finalValues,
        parties: { userId: profile.data.id },
        disableEsign: !withEsign,
      });

      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  };

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
      <div className="px-7 py-3">
        <GenerateFormButtons
          handleSubmit={handleSubmit}
          busy={busy}
          noEsign={!hasSignature}
        />
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
}: {
  formKey: string;
  blocks: ClientBlock<T>[];
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
        key={`${formKey}:${block.text_content ?? JSON.stringify(block.field_schema) ?? JSON.stringify(block.phantom_field_schema)}`}
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
