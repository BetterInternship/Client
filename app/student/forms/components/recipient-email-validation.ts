import { isValidEmail } from "@/lib/utils/string-utils";

export const RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS = 300;

export const getRecipientEmailErrors = (
  recipientEmails: Record<string, string>,
) => {
  return Object.entries(recipientEmails).reduce<Record<string, string>>(
    (errors, [fieldName, emailValue]) => {
      const trimmedEmail = emailValue.trim();

      if (trimmedEmail && !isValidEmail(trimmedEmail)) {
        errors[fieldName] = `${trimmedEmail} is not a valid email.`;
      }

      return errors;
    },
    {},
  );
};
