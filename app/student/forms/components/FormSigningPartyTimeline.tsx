import { FormInput } from "@/components/EditForm";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { StateRecord, StateRecordActions } from "@/hooks/base/useStateRecord";
import { cn } from "@/lib/utils";

export const FormSigningPartyTimeline = ({
  recipientInputAPI,
  isConfirmingRecipients,
}: {
  recipientInputAPI?: {
    recipientEmails: StateRecord;
    recipientErrors: StateRecord;
    recipientEmailActions: StateRecordActions;
  };
  isConfirmingRecipients?: boolean;
}) => {
  const form = useFormRendererContext();
  const recipients = form.formMetadata.getSigningParties();

  return (
    recipients.length > 1 && (
      <Timeline>
        {recipients.map((recipient, index) => {
          const fromMe = recipient.signatory_source?._id === "initiator";
          const fieldName = form.formMetadata.getSigningPartyFieldName(
            recipient._id,
          );
          return (
            <TimelineItem
              key={recipient.signatory_title}
              number={index + 1}
              title={
                <span className="text-sm text-gray-700 font-light">
                  {recipient.signatory_title}
                </span>
              }
              subtitle={
                fromMe ? (
                  !recipientInputAPI?.recipientEmails ? (
                    <span className="text-warning text-xs tracking-normal">
                      you will specify this email
                    </span>
                  ) : isConfirmingRecipients ? (
                    <Badge type="supportive" className="text-xs">
                      {recipientInputAPI.recipientEmails[fieldName]}
                    </Badge>
                  ) : (
                    <FormInput
                      value={recipientInputAPI.recipientEmails[fieldName]}
                      placeholder={"recipient@email.com"}
                      className={cn(
                        "mt-1",
                        recipientInputAPI.recipientErrors[fieldName]
                          ? "text-destructive"
                          : "",
                      )}
                      setter={(value) =>
                        recipientInputAPI.recipientEmailActions.setOne(
                          fieldName,
                          value,
                        )
                      }
                    />
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
