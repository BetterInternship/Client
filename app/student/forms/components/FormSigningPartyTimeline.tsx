import { FormInput } from "@/components/EditForm";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { StateRecord, StateRecordActions } from "@/hooks/base/useStateRecord";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {
  getRecipientEmailErrors,
  RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS,
} from "./recipient-email-validation";

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
  const recipients = form.formMetadata.getSigningParties();

  useEffect(() => {
    if (!recipientInputAPI?.recipientErrorActions || isConfirmingRecipients) {
      return;
    }

    const validationTimeout = window.setTimeout(() => {
      recipientInputAPI.recipientErrorActions.overwrite(
        getRecipientEmailErrors(recipientInputAPI.recipientEmails),
      );
    }, RECIPIENT_EMAIL_VALIDATION_DEBOUNCE_MS);

    return () => window.clearTimeout(validationTimeout);
  }, [
    isConfirmingRecipients,
    recipientInputAPI?.recipientEmails,
    recipientInputAPI?.recipientErrorActions,
  ]);

  return (
    recipients.length > 1 && (
      <Timeline>
        {recipients.map((recipient, index) => {
          const isMe = recipient._id === "initiator";
          const fromMe = recipient.signatory_source?._id === "initiator";
          const fieldName = form.formMetadata.getSigningPartyFieldName(
            recipient._id,
          );
          return (
            <TimelineItem
              key={recipient.signatory_title}
              number={index + 1}
              isMe={isMe}
              title={
                <span className="text-sm text-gray-700 font-light">
                  {recipient.signatory_title}
                </span>
              }
              subtitle={
                fromMe ? (
                  !recipientInputAPI?.recipientEmails ? (
                    <span className="text-warning text-xs tracking-normal text-semibold">
                      you will specify this email
                    </span>
                  ) : isConfirmingRecipients ? (
                    <Badge type="supportive" className="text-xs">
                      {recipientInputAPI.recipientEmails[fieldName]}
                    </Badge>
                  ) : (
                    <div className="mt-1">
                      <FormInput
                        onInput={() =>
                          recipientInputAPI?.recipientErrorActions.clearOne(
                            fieldName,
                          )
                        }
                        value={recipientInputAPI.recipientEmails[fieldName]}
                        placeholder={"Enter email..."}
                        className={cn(
                          recipientInputAPI.recipientErrors[fieldName]
                            ? "border-destructive text-destructive"
                            : "",
                        )}
                        setter={(value) =>
                          recipientInputAPI.recipientEmailActions.setOne(
                            fieldName,
                            value,
                          )
                        }
                      />
                      {recipientInputAPI.recipientErrors[fieldName] && (
                        <span className="mt-1 block text-xs text-destructive">
                          {recipientInputAPI.recipientErrors[fieldName]}
                        </span>
                      )}
                    </div>
                  )
                ) : recipient.signatory_account?.email ? (
                  <span className="text-xs text-primary tracking-wide">
                    {recipient.signatory_account.email ?? ""}
                  </span>
                ) : recipient._id !== "initiator" ? (
                  <span className="text-xs italic text-gray-400">
                    this email will come from someone else
                  </span>
                ) : (
                  <span></span>
                )
              }
              isLast={index === recipients.length - 1}
            />
          );
        })}
      </Timeline>
    )
  );
};
