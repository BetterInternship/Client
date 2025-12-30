import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { useProfileData } from "@/lib/api/student.data.api";
import { PublicUser } from "@/lib/db/db.types";
import {
  ClientField,
  ClientPhantomField,
  FormValues,
} from "@betterinternship/core/forms";
import { useCallback, useMemo } from "react";

/**
 * Makes it easier to use the autofill, derived from profile data.
 * As simple as const autofillValues = useMyAutofill();
 *
 * @hook
 */
export const useMyAutofill = () => {
  const profile = useProfileData();
  const form = useFormRendererContext();
  const autofillValues = useMemo(() => {
    const internshipMoaFields = profile.data?.internship_moa_fields as Record<
      string,
      Record<string, string>
    >;
    if (!internshipMoaFields) return;

    // Destructure to isolate only shared fields or fields for that form
    const autofillValues = {
      ...(internshipMoaFields.base ?? {}),
      ...internshipMoaFields.shared,
      ...(internshipMoaFields[form.formName] ?? {}),
    };

    // Populate with prefillers as well
    for (const field of form.fields) {
      if (field.prefiller) {
        const s = field.prefiller({
          user: profile.data,
        });

        // ! Tentative fix for spaces, move to abstraction later on
        autofillValues[field.field] =
          typeof s === "string" ? s.trim().replace("  ", " ") : s;
      }
    }

    return autofillValues;
  }, [profile.data]);

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

      // Save for future use
      await update.mutateAsync({
        internship_moa_fields: internshipMoaFieldsToSave,
      });
    },
    [update],
  );
};
