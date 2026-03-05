import { useGlobalModal } from "../providers/modal-provider/ModalProvider";
import { LucideIcon } from "lucide-react";
import { MassApplyComposer } from "./components/MassApplyComposer";
import { FormSubmissionSuccessModal } from "./components/FormSubmissionSuccessModal";
import { ResendFormModal } from "./components/ResendFormModal";
import { CancelFormModal } from "./components/CancelFormModal";
import { WarningModal } from "./components/WarningModal";
import { SuccessModal } from "./components/SuccessModal";
import { MassApplyJobsSelector } from "./components/MassApplyJobsSelector";
import {
  DefaultModalLayout,
  SlideUpModalLayout,
} from "../providers/modal-provider/ModalLayout";
import { ReactNode } from "react";
import {
  MassApplyResults,
  MassApplyResultsData,
} from "./components/MassApplyResults";
import { FormPreviewPdfDisplay } from "../features/student/forms/previewer";

/**
 * Simplifies modal config since we usually reuse each of these modal stuffs.
 *
 * @returns
 */
export const useModalRegistry = () => {
  const { openModal: open, closeModal: close } = useGlobalModal();

  const modalRegistry = {
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
      open: (submissionType: "esign" | "manual" | null) =>
        open(
          "form-submission-success",
          DefaultModalLayout,
          <FormSubmissionSuccessModal
            submissionType={submissionType}
            onClose={() => close("form-submission-success")}
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

    // Resend form request
    resendFormRequest: {
      open: (formProcessId: string) =>
        open(
          "resend-form-request",
          DefaultModalLayout,
          <ResendFormModal formProcessId={formProcessId} />,
          {
            title: "Resend form email?",
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
      }: {
        title?: ReactNode;
        content: ReactNode;
        onClose?: () => void;
      }) =>
        open("form-template-details", SlideUpModalLayout, content, {
          title,
          onClose,
        }),
      close: () => close("form-template-details"),
    },

    closeAll: () => close(),
  };

  return modalRegistry;
};

export default useModalRegistry;
