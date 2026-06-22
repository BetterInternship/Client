import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { useProfileData } from "@/lib/api/student.data.api";
import { PublicUser } from "@/lib/db/db.types";
import {
  ClientField,
  ClientPhantomField,
  FormValues,
  parseSignatureImageValue,
  SIGNATURE_IMAGE_FIELD_PREFIX,
} from "@betterinternship/core/forms";
import { useCallback, useMemo } from "react";
import { getFreshHistoryCutoffMsFromStorage } from "@/app/student/forms/fresh-history";

/**
 * Makes it easier to use the autofill, derived from profile data.
 * As simple as const autofillValues = useMyAutofill();
 *
 * @hook
 */
export const useMyAutofill = () => {
  const profile = useProfileData();
  const form = useFormRendererContext();
  const isFreshFormsModeEnabled = getFreshHistoryCutoffMsFromStorage() !== null;
  const autofillValues = useMemo(() => {
    const internshipMoaFields = profile.data?.internship_moa_fields as Record<
      string,
      Record<string, string>
    >;
    const initiatorFieldSet = new Set(form.fields.map((f) => f.field));

    // Only keep autofill values for initiator-owned fields
    const rawValues: FormValues = isFreshFormsModeEnabled
      ? {}
      : {
          ...(internshipMoaFields?.base ?? {}),
          ...(internshipMoaFields?.shared ?? {}),
          ...(internshipMoaFields?.[form.formName] ?? {}),
        };

    const autofillValues: FormValues = {};
    for (const key of Object.keys(rawValues)) {
      if (initiatorFieldSet.has(key)) {
        autofillValues[key] = rawValues[key];
      }
    }

    // Populate with prefillers as well
    for (const field of form.fields) {
      if (field.prefiller) {
        const s = field.prefiller({
          user: profile.data,
        });

        const normalizedValue =
          s === null || s === undefined
            ? ""
            : String(s)
                .trim()
                .replace(/\s{2,}/g, " ");
        if (normalizedValue.length > 0) {
          autofillValues[field.field] = normalizedValue;
        }
      }
    }

    return autofillValues;
  }, [form.fields, form.formName, isFreshFormsModeEnabled, profile.data]);

  return autofillValues;
};

/**
 * Util function for updating the autofill values of a profile.
 *
 * @hook
 */
export const useMyAutofillUpdate = () => {
  const { update } = useProfileActions();

  return useCallback(
    async (
      formName: string,
      fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
      finalValues: FormValues,
    ) => {
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
          if (!internshipMoaFieldsToSave[formName])
            internshipMoaFieldsToSave[formName] = {};
          internshipMoaFieldsToSave[formName][field.field] =
            finalValues[field.field];
        }
      }

      const signatureImageKeys = Object.keys(finalValues).filter((key) =>
        key.startsWith(SIGNATURE_IMAGE_FIELD_PREFIX),
      );
      if (signatureImageKeys.length > 0) {
        const usedSignatureImage = signatureImageKeys.some((key) =>
          parseSignatureImageValue(finalValues[key]),
        );
        internshipMoaFieldsToSave.shared.__signature_image_enabled =
          usedSignatureImage ? "true" : "false";
      }

      // Save for future use
      await update.mutateAsync({
        internship_moa_fields: internshipMoaFieldsToSave,
      });
    },
    [update],
  );
};
