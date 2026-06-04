"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { UserService } from "@/lib/api/services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HeaderTitle } from "@/components/ui/text";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  LucideClipboardCheck,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RecipientSigningPartyTimeline } from "../components/RecipientSigningPartyTimeline";
import { getRecipientEmailErrors } from "../components/recipient-email-validation";
import useModalRegistry from "@/components/modals/modal-registry";

export default function EditRecipientPage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const router = useRouter();
  const modalRegistry = useModalRegistry();
  const queryClient = useQueryClient();
  const profile = useProfileData();
  const searchParams = useSearchParams();
  const eventId = useMemo(
    () => searchParams.get("eventId") || "",
    [searchParams],
  );
  const contextQueryKey = useMemo(
    () => ["correct-form-recipient-context", eventId],
    [eventId],
  );
  const contextQuery = useQuery({
    queryKey: contextQueryKey,
    queryFn: () => UserService.getCorrectFormRecipientContext(eventId),
    enabled: !!eventId,
  });
  const context = contextQuery.data?.context;
  const isInvalidCorrectionLink =
    !eventId ||
    (!!eventId &&
      !contextQuery.isPending &&
      (!contextQuery.data?.success || !context));
  const formLabel = context?.formLabel || "Selected Form";
  const oldEmail = context?.oldEmail || "";
  const signingPartyTitle = context?.signingPartyTitle || "Recipient";
  const targetSigningPartyId = context?.targetSigningPartyId || "";
  const signingParties = context?.signingParties || [];
  const [recipientEmail, setRecipientEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasConfirmedDetails, setHasConfirmedDetails] = useState(false);
  const normalizedRecipientEmail = recipientEmail.trim().toLowerCase();
  const normalizedOldEmail = oldEmail.trim().toLowerCase();
  const isCurrentUserSigningParty = (title: string) =>
    ["student", "initiator"].includes(title.trim().toLowerCase());
  const editableError = useMemo(() => {
    if (!targetSigningPartyId) return "";

    if (
      normalizedRecipientEmail &&
      normalizedOldEmail &&
      normalizedRecipientEmail === normalizedOldEmail
    ) {
      return "Please enter a different email from the previous one.";
    }

    const errors = getRecipientEmailErrors(
      { [targetSigningPartyId]: recipientEmail },
      { studentEmail: profile.data?.email },
    );
    return errors[targetSigningPartyId] || "";
  }, [
    normalizedOldEmail,
    normalizedRecipientEmail,
    profile.data?.email,
    recipientEmail,
    targetSigningPartyId,
  ]);

  redirectIfNotLoggedIn();

  const validateRecipientEmail = () => {
    if (!eventId) {
      setStatusType("error");
      setStatusMessage("Missing event id.");
      return false;
    }

    if (!normalizedRecipientEmail) {
      setStatusType("error");
      setStatusMessage("Recipient email is required.");
      return false;
    }
    if (editableError) {
      setStatusType("error");
      setStatusMessage(editableError);
      return false;
    }

    return true;
  };

  const reviewChanges = () => {
    if (!validateRecipientEmail()) return;

    setStatusType("idle");
    setStatusMessage("");
    setHasConfirmedDetails(false);
    setIsConfirming(true);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConfirming) return;
    if (!validateRecipientEmail()) return;
    if (!hasConfirmedDetails) return;

    setSubmitting(true);
    setStatusType("idle");
    setStatusMessage("");
    try {
      const response = await UserService.correctFormRecipient(
        eventId,
        normalizedRecipientEmail,
      );
      if (!response?.success) {
        setStatusType("error");
        setStatusMessage(
          response?.message || "Could not update recipient email.",
        );
        return;
      }

      setStatusType("success");
      setStatusMessage("Recipient email updated successfully.");
      setRecipientEmail("");
      setIsConfirming(false);
      setHasConfirmedDetails(false);
      await queryClient.invalidateQueries({ queryKey: contextQueryKey });
      modalRegistry.success.open({
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        title: "Recipient email updated",
        message: "We will resend this form to the updated recipient email.",
        primaryAction: {
          label: "Go to Forms",
          onClick: () => {
            modalRegistry.success.close();
            router.push("/forms");
          },
        },
      });
    } catch {
      setStatusType("error");
      setStatusMessage("Could not update recipient email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-6 sm:px-6 sm:py-8 gap-2">
      <HeaderTitle icon={FileText}>Edit Recipient Email</HeaderTitle>
      {isInvalidCorrectionLink ? (
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-base font-semibold text-slate-900">
                This correction link is no longer available
              </p>
              <p className="mt-1 text-sm text-slate-600">
                The recipient may have already been updated, the link may be
                missing an event id, or the correction request is no longer
                valid.
              </p>
              <Button className="mt-4" onClick={() => router.push("/forms")}>
                Go to Forms
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6">
          <p className="text-xs font-medium text-gray-700">
            Step {isConfirming ? 2 : 1} of 2
          </p>
          <p className="text-xl font-semibold text-slate-900">{formLabel}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isConfirming
              ? "Please review the updated recipient details before submitting."
              : "Update the email for this signing step so we can resend the request."}
          </p>

          {!isConfirming && (
            <div className="mt-4">
              <RecipientSigningPartyTimeline
                mode="warning"
                parties={signingParties.map((party) => ({
                  id: party.id,
                  title: party.title,
                  email: party.email,
                  isMe: isCurrentUserSigningParty(party.title),
                  isEditable: party.id === targetSigningPartyId,
                }))}
                oldEmail={oldEmail}
                editableEmail={recipientEmail}
                onEditableEmailChange={setRecipientEmail}
                editableDisabled={submitting}
                editableError={editableError}
              />
            </div>
          )}

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            {isConfirming && (
              <div className="space-y-4">
                <div className="mb-3 flex items-start gap-2">
                  <LucideClipboardCheck className="h-8 w-8 opacity-40" />
                  <span className="text-gray-700 font-semibold">
                    Please check if all your inputs are correct
                  </span>
                </div>
                <RecipientSigningPartyTimeline
                  parties={signingParties.map((party) => ({
                    id: party.id,
                    title: party.title,
                    email:
                      party.id === targetSigningPartyId
                        ? recipientEmail
                        : party.email,
                    isMe: isCurrentUserSigningParty(party.title),
                  }))}
                  isConfirmingRecipients
                />
                <label className="flex cursor-pointer items-center gap-3 rounded-[0.33em] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <Checkbox
                    checked={hasConfirmedDetails}
                    onCheckedChange={(checked) =>
                      setHasConfirmedDetails(checked === true)
                    }
                  />
                  <span>I confirm all the details are correct</span>
                </label>
              </div>
            )}
            {statusType !== "idle" && (
              <p
                className={`text-sm ${statusType === "success" ? "text-emerald-700" : "text-red-600"}`}
              >
                {statusMessage}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {isConfirming && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setIsConfirming(false)}
                >
                  Back
                </Button>
              )}
              <Button
                type={isConfirming ? "submit" : "button"}
                disabled={
                  submitting ||
                  !eventId ||
                  contextQuery.isPending ||
                  !contextQuery.data?.success ||
                  !!editableError ||
                  (isConfirming && !hasConfirmedDetails)
                }
                onClick={() => {
                  if (!isConfirming) reviewChanges();
                }}
              >
                {submitting
                  ? "Updating..."
                  : isConfirming
                    ? "Confirm Changes"
                    : "Review Changes"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
