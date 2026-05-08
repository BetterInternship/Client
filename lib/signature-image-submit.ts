import { FormService } from "@/lib/api/services";
import {
  parseSignatureImageValue,
  type FormValues,
} from "@betterinternship/core/forms";

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
    if (!signatureImage || signatureImage.image.storage !== "inline") continue;

    const result = await FormService.uploadSignatureImage({
      source: signatureImage.source,
      dataUrl: signatureImage.image.dataUrl,
    });

    if (!result.value) {
      throw new Error("Signature image upload did not return a saved image.");
    }

    nextValues[field] = result.value;
  }

  removeDuplicateSignatureImageKeys(nextValues);

  return nextValues;
}
