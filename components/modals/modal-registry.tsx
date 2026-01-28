import { useQueryClient } from "@tanstack/react-query";
import { useGlobalModal } from "../providers/ModalProvider";
import { AlertCircle, CheckCircle, LucideIcon } from "lucide-react";

import { IncompleteProfileContent } from "./components/IncompleteProfileModal";
import { MassApplyComposer } from "./components/MassApplyComposer";
import {
  MassApplyResults,
  MassApplyResultsData,
} from "./components/MassApplyResults";
import { SpecifySigningPartiesModal } from "./components/SpecifySigningPartiesModal";
import { FormSubmissionSuccessModal } from "./components/FormSubmissionSuccessModal";
import {
  ClientBlock,
  ClientField,
  ClientPhantomField,
  FormValues,
  IFormSigningParty,
} from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";
import { IFormFiller } from "../features/student/forms/form-filler.ctx";
import { ResendFormModal } from "./components/ResendFormModal";
import { CancelFormModal } from "./components/CancelFormModal";
import { WarningModal } from "./components/WarningModal";
import { SuccessModal } from "./components/SuccessModal";
import { MassApplyJobsSelector } from "./components/MassApplyJobsSelector";

/**
 * Simplifies modal config since we usually reuse each of these modal stuffs.
 *
 * @returns
 */
export const useModalRegistry = () => {
  const { open, close } = useGlobalModal();
  const queryClient = useQueryClient();

  const modalRegistry = {
    // The modal shown when someone's profile is incomplete
    incompleteProfile: {
      open: () =>
        open(
          "incomplete-profile",
          <IncompleteProfileContent
            onFinish={() => {
              void queryClient
                .invalidateQueries({ queryKey: ["my-profile"] })
                .then(() => close("incomplete-profile"));
            }}
          />,
          {
            allowBackdropClick: false,
            showHeaderDivider: true,
            title: "Complete your profile",
            onClose: () => close("incomplete-profile"),
          },
        ),
      close: () => close("incomplete-profile"),
    },

    // Mass apply fill-out modal
    massApplyCompose: {
      open: ({
        bulkCoverLetter,
        runMassApply,
        setBulkCoverLetter,
        massApplying,
        selectedCount,
      }: {
        bulkCoverLetter: string;
        runMassApply: (text: string) => Promise<void>;
        setBulkCoverLetter: (bulkCoverLetter: string) => void;
        massApplying: boolean;
        selectedCount: string;
      }) =>
        open(
          "mass-apply-compose",
          <MassApplyComposer
            initialText={bulkCoverLetter}
            disabled={massApplying}
            minChars={0}
            maxChars={500}
            onCancel={() => close("mass-apply-compose")}
            onSubmit={async (text) => {
              setBulkCoverLetter(text);
              await runMassApply(text);
              close("mass-apply-compose");
            }}
          />,
          {
            title: `Apply to ${selectedCount} selected`,
            allowBackdropClick: false,
          },
        ),
      close: () => close("mass-apply-compose"),
    },

    // The modal shown after performing a mass apply
    massApplyResult: {
      open: ({
        massApplyResultsData,
        clearSelection,
        setSelectMode,
      }: {
        massApplyResultsData: MassApplyResultsData;
        clearSelection: () => void;
        setSelectMode: (selectMode: boolean) => void;
      }) =>
        open(
          "mass-apply-results",
          <MassApplyResults
            data={massApplyResultsData}
            onClose={() => close("mass-apply-results")}
            onClearSelection={() => {
              clearSelection();
              setSelectMode(false);
              close("mass-apply-results");
            }}
          />,
          {
            title: "Bulk application summary",
            showHeaderDivider: true,
          },
        ),
      close: () => close("mass-apply-results"),
    },

    // Email confirmation modal
    specifySigningParties: {
      open: (
        fields: (
          | ClientField<[PublicUser]>
          | ClientPhantomField<[PublicUser]>
        )[],
        formFiller: IFormFiller,
        signingPartyBlocks: ClientBlock<[PublicUser]>[],
        handleSubmit: (signingPartyValues: FormValues) => Promise<any>,
        autofillValues?: FormValues,
        signingParties?: IFormSigningParty[],
      ) =>
        open(
          "specify-signing-parties",
          <SpecifySigningPartiesModal
            fields={fields}
            formFiller={formFiller}
            signingPartyBlocks={signingPartyBlocks}
            handleSubmit={handleSubmit}
            close={() => close("specify-signing-parties")}
            autofillValues={autofillValues}
            signingParties={signingParties}
          />,
          {
            title: "Next Signing Parties",
            closeOnEsc: false,
            allowBackdropClick: false,
            hasClose: false,
            showHeaderDivider: true,
          },
        ),
      close: () => close("specify-signing-parties"),
    },

    // Form submission success modal
    formSubmissionSuccess: {
      open: (submissionType: "esign" | "manual" | null) =>
        open(
          "form-submission-success",
          <FormSubmissionSuccessModal
            submissionType={submissionType}
            onClose={() => close("form-submission-success")}
          />,
          {
            closeOnEsc: false,
            allowBackdropClick: false,
            hasClose: false,
            onClose: () => close("form-submission-success"),
          },
        ),
      close: () => close("form-submission-success"),
    },

    // Cancel from request
    cancelFormRequest: {
      open: (formProcessId: string) =>
        open(
          "cancel-form-request",
          <CancelFormModal formProcessId={formProcessId} />,
          {
            title: "Cancel this form request?",
            hasClose: false,
            allowBackdropClick: false,
            closeOnEsc: false,
          },
        ),
      close: () => close("cancel-form-request"),
    },

    // Resend form request
    resendFormRequest: {
      open: (formProcessId: string) =>
        open(
          "resend-form-request",
          <ResendFormModal formProcessId={formProcessId} />,
          {
            title: "Resend form email?",
            hasClose: false,
            allowBackdropClick: false,
            closeOnEsc: false,
          },
        ),
      close: () => close("resend-form-request"),
    },

    // Duplicate form warning
    duplicateFormWarning: {
      open: ({
        hasPendingInstance,
        hasCompletedInstance: _hasCompletedInstance,
        onGenerateAnother,
        onGoBack,
      }: {
        hasPendingInstance: boolean;
        hasCompletedInstance: boolean;
        onGenerateAnother: () => void;
        onGoBack: () => void;
      }) => {
        const isPending = hasPendingInstance;

        const title = isPending
          ? "You already have an outgoing instance of this form"
          : "You've already generated this form before";

        const message = isPending
          ? "This form is currently being filled out by other signatories. It is highly recommended to cancel the pending attempt before starting a new one. Multiple outgoing versions may cause confusion."
          : "You already have a completed version of this form. Are you sure you want another one?";

        return open(
          "duplicate-form-warning",
          <WarningModal
            icon={isPending ? AlertCircle : CheckCircle}
            iconColor={isPending ? "text-amber-600" : "text-emerald-600"}
            title={title}
            message={message}
            primaryAction={{
              label: "Generate another copy",
              onClick: onGenerateAnother,
            }}
            secondaryAction={{
              label: "Go back",
              onClick: onGoBack,
            }}
            close={() => close("duplicate-form-warning")}
          />,
          {
            title: " ",
            allowBackdropClick: false,
            closeOnEsc: false,
            hasClose: false,
          },
        );
      },
      close: () => close("duplicate-form-warning"),
    },

    // Generic warning modal for reuse
    warning: {
      open: ({
        icon,
        iconColor,
        title,
        message,
        primaryAction,
        secondaryAction,
      }: {
        icon: LucideIcon;
        iconColor: string;
        title: string;
        message: string;
        primaryAction: { label: string; onClick: () => void };
        secondaryAction?: { label: string; onClick: () => void };
      }) =>
        open(
          "warning",
          <WarningModal
            icon={icon}
            iconColor={iconColor}
            title={title}
            message={message}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            close={() => close("warning")}
          />,
          {
            title: " ",
            allowBackdropClick: false,
            closeOnEsc: false,
            hasClose: false,
          },
        ),
      close: () => close("warning"),
    },

    // Generic success modal for reuse
    success: {
      open: ({
        icon,
        iconColor,
        title,
        message,
        primaryAction,
        secondaryAction,
      }: {
        icon: LucideIcon;
        iconColor: string;
        title: string;
        message: string;
        primaryAction: { label: string; onClick: () => void };
        secondaryAction?: { label: string; onClick: () => void };
      }) =>
        open(
          "success",
          <SuccessModal
            icon={icon}
            iconColor={iconColor}
            title={title}
            message={message}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            close={() => close("success")}
          />,
          {
            title: " ",
            allowBackdropClick: false,
            closeOnEsc: false,
            hasClose: false,
          },
        ),
      close: () => close("success"),
    },

    // Mass apply job selector (God mode)
    massApplyJobSelector: {
      open: ({
        selectedStudentIds,
        onClose,
        panelClassName,
      }: {
        selectedStudentIds: Set<string>;
        onClose: () => void;
        panelClassName?: string;
      }) =>
        open(
          "mass-apply-job-selector",
          <MassApplyJobsSelector
            selectedStudentIds={selectedStudentIds}
            onClose={() => {
              onClose();
              close("mass-apply-job-selector");
            }}
          />,
          {
            title: " ",
            panelClassName,
          },
        ),
      close: () => close("mass-apply-job-selector"),
    },
  };

  return modalRegistry;
};

export default useModalRegistry;
