import { useQueryClient } from "@tanstack/react-query";
import { useGlobalModal } from "../providers/ModalProvider";

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
} from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";
import { IFormFiller } from "../features/student/forms/form-filler.ctx";
import { ResendFormModal } from "./components/ResendFormModal";
import { CancelFormModal } from "./components/CancelFormModal";

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
      open: () =>
        open(
          "form-submission-success",
          <FormSubmissionSuccessModal
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
  };

  return modalRegistry;
};

export default useModalRegistry;
