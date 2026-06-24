import { FormService } from "@/lib/api/services";
import {
  isInlineSignatureImagePayload,
  parseSignatureImageValue,
  type FormValues,
} from "@betterinternship/core/forms";
import { resolveSignatureImageValue } from "@/lib/signed-url";

const SIGNATURE_IMAGE_PREFIX = "__signatureImage:";

const normalizeSignatureImageField = (field: string) =>
  field.endsWith(":default") ? field.slice(0, -":default".length) : field;

function removeDuplicateSignatureImageKeys(values: FormValues) {
  const preferredKeys = new Set(
    Object.keys(values)
      .filter((key) => key.startsWith(SIGNATURE_IMAGE_PREFIX) && key.endsWith(":default"))
      .map((key) => normalizeSignatureImageField(key.slice(SIGNATURE_IMAGE_PREFIX.length))),
  );

  for (const key of Object.keys(values)) {
    if (!key.startsWith(SIGNATURE_IMAGE_PREFIX) || key.endsWith(":default")) continue;
    const normalizedField = normalizeSignatureImageField(key.slice(SIGNATURE_IMAGE_PREFIX.length));
    if (preferredKeys.has(normalizedField)) delete values[key];
  }
}

export async function withSubmittedSignatureImages(values: FormValues): Promise<FormValues> {
  const nextValues: FormValues = { ...values };

  for (const [field, value] of Object.entries(values)) {
    const signatureImage = parseSignatureImageValue(value);
    if (!signatureImage) continue;

    // Inline → upload to server, get bucket reference
    if (isInlineSignatureImagePayload(signatureImage.image)) {
      const result = await FormService.uploadSignatureImage({
        source: signatureImage.source,
        dataUrl: signatureImage.image.dataUrl,
      });

      if (!result.value) {
        throw new Error("Signature image upload did not return a saved image.");
      }

      nextValues[field] = result.value;
      continue;
    }

    // Bucket → resolve fresh signed URL
    nextValues[field] = await resolveSignatureImageValue(value);
  }

  removeDuplicateSignatureImageKeys(nextValues);

  return nextValues;
}
