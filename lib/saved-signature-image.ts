import {
  getSignatureImageFieldKey,
  type FormValues,
} from "@betterinternship/core/forms";

export const withSavedSignatureImagesForFields = ({
  values,
  signatureFields,
  signatureImage,
}: {
  values: FormValues;
  signatureFields: { field: string }[];
  signatureImage?: string | null;
}) => {
  if (!signatureImage?.trim()) return values;

  const nextValues = { ...values };
  for (const signatureField of signatureFields) {
    const imageFieldKey = getSignatureImageFieldKey(signatureField.field);
    if (Object.prototype.hasOwnProperty.call(nextValues, imageFieldKey))
      continue;
    nextValues[imageFieldKey] = signatureImage;
  }

  return nextValues;
};
