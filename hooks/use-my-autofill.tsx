import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { useProfileData } from "@/lib/api/student.data.api";
import { useMemo } from "react";

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
