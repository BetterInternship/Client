import { FormInput } from "@/components/EditForm";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { AlertTriangle } from "lucide-react";
import { StateRecord, StateRecordActions } from "@/hooks/base/useStateRecord";
import { cn } from "@/lib/utils";

export type RecipientTimelineParty = {
  id: string;
  title: string;
  email?: string;
  isMe?: boolean;
  isEditable?: boolean;
};

export function RecipientSigningPartyTimeline({
  parties,
  mode = "default",
  oldEmail: _oldEmail,
  recipientInputAPI,
  isConfirmingRecipients,
  editableEmail,
  onEditableEmailChange,
  editableDisabled,
  editableError,
}: {
  parties: RecipientTimelineParty[];
  mode?: "default" | "warning";
  oldEmail?: string;
  recipientInputAPI?: {
    recipientEmails: StateRecord;
    recipientErrors: StateRecord;
    recipientEmailActions: StateRecordActions;
    recipientErrorActions?: StateRecordActions;
  };
  isConfirmingRecipients?: boolean;
  editableEmail?: string;
  onEditableEmailChange?: (value: string) => void;
  editableDisabled?: boolean;
  editableError?: string;
}) {
  if (parties.length <= 1) return null;

  return (
    <Timeline>
      {parties.map((party, index) => {
        const fieldName = party.id;
        const isEditable = !!party.isEditable;
        const recipientValue =
          recipientInputAPI?.recipientEmails?.[fieldName] ?? party.email ?? "";
        const recipientError = recipientInputAPI?.recipientErrors?.[fieldName];

        return (
          <TimelineItem
            key={party.id || `${party.title}-${index}`}
            number={index + 1}
            isMe={party.isMe}
            title={
              <span className="text-sm text-gray-700 font-light">
                {party.title}
              </span>
            }
            subtitle={
              isEditable ? (
                mode === "warning" ? (
                  <div className="mt-1 space-y-2 rounded-[0.33em] border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-800">
                      <AlertTriangle className="h-5 w-5" />
                      Update this email
                    </div>
                    <span className="block text-xs text-amber-900 tracking-wide">
                      Current email: {party.email || "No email set"}
                    </span>
                    <input
                      type="email"
                      className={cn(
                        "w-full rounded-[0.33em] border bg-white px-3 py-2 text-sm outline-none ring-0",
                        editableError
                          ? "border-destructive text-destructive focus:border-destructive"
                          : "border-amber-300 focus:border-amber-500",
                      )}
                      value={editableEmail || ""}
                      onChange={(e) => onEditableEmailChange?.(e.target.value)}
                      placeholder="name@company.com"
                      disabled={editableDisabled}
                    />
                    {editableError && (
                      <span className="block text-xs text-destructive">
                        {editableError}
                      </span>
                    )}
                  </div>
                ) : !recipientInputAPI?.recipientEmails ? (
                  <span className="text-warning text-xs tracking-normal text-semibold">
                    you will specify this email
                  </span>
                ) : isConfirmingRecipients ? (
                  <Badge type="supportive" className="text-xs">
                    {recipientValue}
                  </Badge>
                ) : (
                  <div className="mt-1">
                    <FormInput
                      onInput={() =>
                        recipientInputAPI?.recipientErrorActions?.clearOne(
                          fieldName,
                        )
                      }
                      value={recipientValue}
                      placeholder={"Enter email..."}
                      className={cn(
                        recipientError
                          ? "border-destructive text-destructive"
                          : "",
                      )}
                      setter={(value) =>
                        recipientInputAPI?.recipientEmailActions.setOne(
                          fieldName,
                          value,
                        )
                      }
                    />
                    {recipientError && (
                      <span className="mt-1 block text-xs text-destructive">
                        {recipientError}
                      </span>
                    )}
                  </div>
                )
              ) : (
                !party.isMe && (
                  <span className="text-xs text-primary tracking-wide">
                    {party.email || "No email set"}
                  </span>
                )
              )
            }
            isLast={index === parties.length - 1}
          />
        );
      })}
    </Timeline>
  );
}
