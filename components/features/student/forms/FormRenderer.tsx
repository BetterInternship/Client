"use client";

import { ClientBlock } from "@betterinternship/core/forms";
import { useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderRenderer, ParagraphRenderer } from "./BlockRenderer";
import { useFormRendererContext } from "./form-renderer.ctx";
import { FormActionButtons } from "./form-action-buttons";
import { getBlockField, isBlockField } from "./utils";
import { useProfileData } from "@/lib/api/student.data.api";
import { FormService } from "@/lib/api/services";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";

export function FormFillerRenderer() {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const profile = useProfileData();

  const formMetdata = form.formMetadata ?? null;
  const fields = formMetdata?.getFieldsForClientService("initiator") ?? [];
  const filteredBlocks = form.blocks;

  const { update } = useProfileActions();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

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
    const finalValues = formFiller.getFinalValues(autofillValues);
    const errors = formFiller.validate(form.fields, autofillValues);
    if (Object.keys(errors).length) return;

    // proceed to save + submit
    try {
      setBusy(true);

      const internshipMoaFieldsToSave: Record<
        string,
        Record<string, string>
      > = {
        shared: {} as Record<string, string>,
      };

      // Save it per field or shared
      for (const field of fields) {
        if (field.shared) {
          internshipMoaFieldsToSave.shared[field.field] =
            finalValues[field.field];
        } else {
          if (!internshipMoaFieldsToSave[form.formName])
            internshipMoaFieldsToSave[form.formName] = {};
          internshipMoaFieldsToSave[form.formName][field.field] =
            finalValues[field.field];
        }
      }

      // Save for future use
      await update.mutateAsync({
        internship_moa_fields: internshipMoaFieldsToSave,
      });

      // Generate form
      if (withEsign) {
        await FormService.initiateForm({
          formName: form.formName,
          formVersion: form.formVersion,
          values: finalValues,
        });
      } else {
        await FormService.filloutForm({
          formName: form.formName,
          formVersion: form.formVersion,
          values: finalValues,
        });
      }

      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  };

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
          values={formFiller.getFinalValues(autofillValues)}
          onChange={formFiller.setValue}
          errors={formFiller.errors}
          setSelected={form.setSelectedPreviewId}
          onBlurValidate={() => formFiller.validate}
        />
      </div>
      <div className="px-7 py-3">
        <FormActionButtons
          handleSubmit={handleSubmit}
          busy={busy}
          noEsign={!formMetdata.mayInvolveEsign()}
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
  return sortedBlocks.map((block, i) => {
    const field = getBlockField(block)!;
    return (
      <div className="space-between flex flex-row" key={`${formKey}:${i}`}>
        <div
          className="flex-1"
          onFocus={() => setSelected(block.field_schema?.field as string)}
        >
          {isBlockField(block) && getBlockField(block)?.source === "manual" && (
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
