import { useGlobalModal } from "../providers/modal-provider/ModalProvider";
import { LucideIcon } from "lucide-react";
import { MassApplyComposer } from "./components/MassApplyComposer";
import { FormSubmissionSuccessModal } from "./components/FormSubmissionSuccessModal";
import { FollowUpFormModal } from "./components/ResendFormModal";
import { CancelFormModal } from "./components/CancelFormModal";
import { WarningModal } from "./components/WarningModal";
import { SuccessModal } from "./components/SuccessModal";
import { SuperListingClosedModal } from "./components/SuperListingClosedModal";
import { MassApplyJobsSelector } from "./components/MassApplyJobsSelector";
import {
  DefaultModalLayout,
  SlideUpModalLayout,
} from "../providers/modal-provider/ModalLayout";
import { ReactNode, useMemo } from "react";
import {
  MassApplyResults,
  MassApplyResultsData,
} from "./components/MassApplyResults";
import { CompleteProfileApplyModal } from "./components/CompleteProfileApplyModal";
import { FormPreviewPdfDisplay } from "../features/student/forms/previewer";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { ApplicationAction } from "@/lib/consts/application";
import { EmployerApplication } from "@/lib/db/db.types";
import ApplicationActionModal from "./ApplicationActionModal";
import DeleteJobListingModal from "./DeleteJobListingModal";
import { Job, PublicUser } from "@/lib/db/db.types";

/**
 * Simplifies modal config since we usually reuse each of these modal stuffs.
 *
 * @returns
 */
export const useModalRegistry = () => {
  const { openModal: open, closeModal: close } = useGlobalModal();

  const modalRegistry = useMemo(
    () => ({
      // modal for deleting a job listing.
      deleteListing: {
        open: ({
          job,
          isProcessing,
          onConfirm,
        }: {
          job: Job;
          isProcessing: boolean;
          onConfirm: () => void;
        }) =>
          open(
            "delete-listing",
            DefaultModalLayout,
            <DeleteJobListingModal
              job={job}
              isProcessing={isProcessing}
              onConfirm={onConfirm}
              onCancel={() => close("delete-listing")}
            />,
            {
              title: `Delete ${job.title}`,
              closeOnBackdropClick: true,
              closeOnEscapeKey: true,
              showHeaderDivider: true,
            },
          ),
        close: () => close("delete-listing"),
      },
      // modal for any action performed on a job application.
      applicationAction: {
        open: ({
          type,
          applicants,
          isProcessing,
          onConfirm,
        }: {
          type: ApplicationAction;
          applicants: EmployerApplication[];
          isProcessing: boolean;
          onConfirm: () => void;
        }) =>
          open(
            "application-action",
            DefaultModalLayout,
            <ApplicationActionModal
              type={type}
              applicants={applicants}
              isProcessing={isProcessing}
              onConfirm={onConfirm}
              onCancel={() => close("application-action")}
            />,
            {
              title: `Change application status`,
              closeOnBackdropClick: true,
              closeOnEscapeKey: true,
              showHeaderDivider: true,
            },
          ),
        close: () => close("application-action"),
      },
      completeProfileApply: {
        open: ({
          profile,
          onApply,
          applyLabel,
        }: {
          profile: PublicUser | null;
          onApply: () => void | Promise<void>;
          applyLabel?: string;
        }) =>
          open(
            "complete-profile-apply",
            DefaultModalLayout,
            <CompleteProfileApplyModal
              profile={profile}
              applyLabel={applyLabel}
              onApply={onApply}
              onCancel={() => close("complete-profile-apply")}
            />,
            {
              closeOnBackdropClick: false,
              showCloseButton: false,
              showHeaderDivider: false,
            },
          ),
        close: () => close("complete-profile-apply"),
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
            DefaultModalLayout,
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
              closeOnBackdropClick: false,
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
            DefaultModalLayout,
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

      // Form submission success modal
      formSubmissionSuccess: {
        open: (
          submissionType: "esign" | "manual" | null,
          onClose: () => void,
          firstRecipient?: IFormSigningParty,
        ) =>
          open(
            "form-submission-success",
            DefaultModalLayout,
            <FormSubmissionSuccessModal
              submissionType={submissionType}
              onClose={onClose}
              firstRecipient={firstRecipient}
            />,
            {
              closeOnEscapeKey: false,
              closeOnBackdropClick: false,
              showCloseButton: false,
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
            DefaultModalLayout,
            <CancelFormModal formProcessId={formProcessId} />,
            {
              title: "Cancel this form request?",
              showCloseButton: false,
              closeOnBackdropClick: false,
              closeOnEscapeKey: false,
              showHeaderDivider: true,
            },
          ),
        close: () => close("cancel-form-request"),
      },

      // Follow up form request
      followUpFormRequest: {
        open: (formProcessId: string) =>
          open(
            "resend-form-request",
            DefaultModalLayout,
            <FollowUpFormModal formProcessId={formProcessId} />,
            {
              title: "Send follow-up email?",
              showCloseButton: false,
              closeOnBackdropClick: false,
              closeOnEscapeKey: false,
              showHeaderDivider: true,
            },
          ),
        close: () => close("resend-form-request"),
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
            DefaultModalLayout,
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
              closeOnBackdropClick: false,
              closeOnEscapeKey: false,
              showCloseButton: false,
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
            DefaultModalLayout,
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
              closeOnBackdropClick: false,
              closeOnEscapeKey: false,
              showCloseButton: false,
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
            DefaultModalLayout,
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

      previewFormPdf: {
        open: ({ documentUrl }: { documentUrl: string }) =>
          open(
            "preview-form-pdf",
            SlideUpModalLayout,
            <FormPreviewPdfDisplay
              documentUrl={documentUrl}
              blocks={[]}
              values={{}}
            />,
            {
              title: "PDF Preview",
            },
          ),
        close: () => close("preview-form-pdf"),
      },

      formTemplateDetails: {
        open: ({
          title,
          content,
          onClose,
          onRequestClose,
          showCloseButton,
          closeOnBackdropClick,
          closeOnEscapeKey,
          mobileFullscreen,
        }: {
          title?: ReactNode;
          content: ReactNode;
          onClose?: () => void;
          onRequestClose?: () => void;
          showCloseButton?: boolean;
          closeOnBackdropClick?: boolean;
          closeOnEscapeKey?: boolean;
          mobileFullscreen?: boolean;
        }) =>
          open("form-template-details", SlideUpModalLayout, content, {
            title,
            onClose,
            onRequestClose,
            showCloseButton,
            closeOnBackdropClick,
            closeOnEscapeKey,
            mobileFullscreen,
          }),
        close: () => close("form-template-details"),
      },

      centeredDetails: {
        open: ({
          title,
          content,
          showHeaderDivider = true,
          showCloseButton = true,
          closeOnBackdropClick = true,
          closeOnEscapeKey = true,
        }: {
          title?: ReactNode;
          content: ReactNode;
          showHeaderDivider?: boolean;
          showCloseButton?: boolean;
          closeOnBackdropClick?: boolean;
          closeOnEscapeKey?: boolean;
        }) =>
          open("centered-details", DefaultModalLayout, content, {
            title,
            showHeaderDivider,
            showCloseButton,
            closeOnBackdropClick,
            closeOnEscapeKey,
          }),
        close: () => close("centered-details"),
      },

      superListingClosed: {
        open: ({
          title,
          description,
          viewLabel,
          leaveLabel,
          accentColor,
          onView,
          onLeave,
        }: {
          title?: string;
          description?: string;
          viewLabel?: string;
          leaveLabel?: string;
          accentColor?: string;
          onView: () => void;
          onLeave: () => void;
        }) =>
          open(
            "super-listing-closed",
            DefaultModalLayout,
            <SuperListingClosedModal
              title={title}
              description={description}
              viewLabel={viewLabel}
              leaveLabel={leaveLabel}
              accentColor={accentColor}
              onView={() => {
                onView();
                close("super-listing-closed");
              }}
              onLeave={() => {
                onLeave();
                close("super-listing-closed");
              }}
            />,
            {
              title: " ",
              showCloseButton: false,
              closeOnBackdropClick: false,
              closeOnEscapeKey: false,
              showHeaderDivider: false,
            },
          ),
        close: () => close("super-listing-closed"),
      },

      closeAll: () => close(),
    }),
    [close, open],
  );

  return modalRegistry;
};

export default useModalRegistry;
