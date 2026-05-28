import { isValidEmail } from "@/lib/utils/string-utils";

export const RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS = 300;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

type RecipientEmailValidationOptions = {
  studentEmail?: string | null;
};

export const getRecipientEmailErrors = (
  recipientEmails: Record<string, string>,
  options: RecipientEmailValidationOptions = {},
) => {
  return Object.entries(recipientEmails).reduce<Record<string, string>>(
    (errors, [fieldName, emailValue]) => {
      const trimmedEmail = emailValue.trim();

    if (!trimmedEmail) return;

    // Rule: email format
    if (!isValidEmail(trimmedEmail)) {
      errors[fieldName] = `${trimmedEmail} is not a valid email.`;
      return;
    }

    // Rule: recipient email cannot be the student's email
    if (normalizedStudentEmail && normalizedEmail === normalizedStudentEmail) {
      errors[fieldName] = "Use a recipient email that is different from yours.";
      return;
    }

    fieldNamesByEmail.set(normalizedEmail, [
      ...(fieldNamesByEmail.get(normalizedEmail) ?? []),
      fieldName,
    ]);

  // Rule: all recipient emails must be unique
  // fieldNamesByEmail.forEach((fieldNames) => {
  //   if (fieldNames.length < 2) return;

  //   fieldNames.forEach((fieldName) => {
  //     errors[fieldName] = "Each recipient must have a unique email.";
  //   });
  // });

      return errors;
    },
    {},
  );
};
