import { FormMetadata, type FormValues } from "@betterinternship/core/forms";

const MAX_DERIVATION_PASSES = 3;

/**
 * Resolves derived field values from current form values.
 * Uses a small fixed-point loop so chained derived fields can settle.
 */
export function withDerivedFormValues(
  formMetadata: FormMetadata<any[]> | null | undefined,
  baseValues: FormValues,
): FormValues {
  if (!formMetadata) return baseValues;

  const resolvedValues: FormValues = { ...baseValues };

  for (let pass = 0; pass < MAX_DERIVATION_PASSES; pass++) {
    let hasChanges = false;
    const fields = formMetadata.getFieldsForClientService(
      undefined,
      undefined,
      resolvedValues,
    );

    for (const field of fields) {
      if (field.source !== "derived" || typeof field.prefiller !== "function")
        continue;

      try {
        const nextRaw = field.prefiller({} as Record<string, never>);
        const nextValue =
          nextRaw === null || nextRaw === undefined ? "" : String(nextRaw);

        if (resolvedValues[field.field] !== nextValue) {
          resolvedValues[field.field] = nextValue;
          hasChanges = true;
        }
      } catch {
        // Ignore malformed prefiller execution in preview-time derivation.
      }
    }

    if (!hasChanges) break;
  }

  return resolvedValues;
}
