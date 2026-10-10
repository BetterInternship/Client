import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { StateRecord, StateRecordActions } from "@/hooks/base/useStateRecord";
import { useEffect, useMemo } from "react";
import { getRecipientEmailOptions } from "@betterinternship/core/forms";
import { useProfileData } from "@/lib/api/student.data.api";
import {
  getRecipientEmailErrors,
  RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS,
} from "./recipient-email-validation";
import { RecipientSigningPartyTimeline } from "./RecipientSigningPartyTimeline";

export const FormSigningPartyTimeline = ({
  recipientInputAPI,
  isConfirmingRecipients,
}: {
  recipientInputAPI?: {
    recipientEmails: StateRecord;
    recipientErrors: StateRecord;
    recipientEmailActions: StateRecordActions;
    recipientErrorActions: StateRecordActions;
  };
  isConfirmingRecipients?: boolean;
}) => {
  const form = useFormRendererContext();
  const profile = useProfileData();
  const recipients = useMemo(
    () => form.formMetadata.getSigningParties(),
    [form.formMetadata],
  );

  useEffect(() => {
    if (!recipientInputAPI?.recipientErrorActions || isConfirmingRecipients) {
      return;
    }

    const validationTimeout = window.setTimeout(() => {
      const errors = getRecipientEmailErrors(
        recipientInputAPI.recipientEmails,
        {
          studentEmail: profile.data?.email,
          recipients,
        },
      );
      if (
        JSON.stringify(errors) !==
        JSON.stringify(recipientInputAPI.recipientErrors)
      ) {
        recipientInputAPI.recipientErrorActions.overwrite(errors);
      }
    }, RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS);

    return () => window.clearTimeout(validationTimeout);
  }, [
    isConfirmingRecipients,
    profile.data?.email,
    recipientInputAPI?.recipientEmails,
    recipientInputAPI?.recipientErrors,
    recipientInputAPI?.recipientErrorActions,
    recipients,
  ]);

  return (
    <RecipientSigningPartyTimeline
      parties={recipients.map((recipient) => ({
        id: form.formMetadata.getSigningPartyFieldName(recipient._id),
        title: recipient.signatory_title,
        email: recipient.signatory_account?.email ?? "",
        emailOptions: getRecipientEmailOptions(recipient),
        isMe: recipient._id === "initiator",
        isEditable: recipient.signatory_source?._id === "initiator",
      }))}
      recipientInputAPI={recipientInputAPI}
      isConfirmingRecipients={isConfirmingRecipients}
    />
  );
};
