import {
  getSignatureImageFieldKey,
  type FormValues,
} from "@betterinternship/core/forms";
import { resolveSignatureImageValue } from "@/lib/signed-url";

export const withSavedSignatureImagesForFields = async ({
  values,
  signatureFields,
  signatureImage,
}: {
  values: FormValues;
  signatureFields: { field: string }[];
  signatureImage?: string | null;
}) => {
  if (!signatureImage?.trim()) return values;

  const resolvedSignatureImage = await resolveSignatureImageValue(signatureImage);
  const nextValues = { ...values };
  for (const signatureField of signatureFields) {
    const imageFieldKey = getSignatureImageFieldKey(signatureField.field);
    nextValues[imageFieldKey] = resolvedSignatureImage;
  }

  return nextValues;
};
