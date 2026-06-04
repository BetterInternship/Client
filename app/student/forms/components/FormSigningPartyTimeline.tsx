import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { StateRecord, StateRecordActions } from "@/hooks/base/useStateRecord";
import { useEffect } from "react";
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
  const recipients = form.formMetadata.getSigningParties();

  useEffect(() => {
    if (!recipientInputAPI?.recipientErrorActions || isConfirmingRecipients) {
      return;
    }

    const validationTimeout = window.setTimeout(() => {
      recipientInputAPI.recipientErrorActions.overwrite(
        getRecipientEmailErrors(recipientInputAPI.recipientEmails, {
          studentEmail: profile.data?.email,
        }),
      );
    }, RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS);

    return () => window.clearTimeout(validationTimeout);
  }, [
    isConfirmingRecipients,
    profile.data?.email,
    recipientInputAPI?.recipientEmails,
    recipientInputAPI?.recipientErrorActions,
  ]);

  return (
    <RecipientSigningPartyTimeline
      parties={recipients.map((recipient) => ({
        id: form.formMetadata.getSigningPartyFieldName(recipient._id),
        title: recipient.signatory_title,
        email: recipient.signatory_account?.email ?? "",
        isMe: recipient._id === "initiator",
        isEditable: recipient.signatory_source?._id === "initiator",
      }))}
      recipientInputAPI={recipientInputAPI}
      isConfirmingRecipients={isConfirmingRecipients}
    />
  );
};
