import { IncompleteProfileContent } from "./IncompleteProfileModal";
import { useGlobalModal } from "../providers/ModalProvider";
import { FormFlowRouter } from "../features/student/forms/FormFlowRouter";
import { MassApplyComposer } from "../features/student/mass-apply/MassApplyComposer";
import {
  MassApplyResults,
  MassApplyResultsData,
} from "../features/student/mass-apply/MassApplyResults";
import { useQueryClient } from "@tanstack/react-query";

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

    // The modal that's shown when someone is opening a form template
    formGenerator: {
      open: ({
        formName,
        formVersion,
        formLabel,
        setTab,
      }: {
        formName: string;
        formVersion: number;
        formLabel: string;
        setTab: (tab: string) => void;
      }) =>
        open(
          "form-generator-form",
          <FormFlowRouter
            formName={formName}
            formVersion={formVersion}
            onGoToMyForms={() => {
              setTab("forms");
              close("form-generator-form");
            }}
          />,
          {
            title: `Generate ${formLabel}`,
            hasClose: true,
            allowBackdropClick: false,
            panelClassName: "sm:w-full sm:max-w-2xl",
            useCustomPanel: true,
          },
        ),
      close: () => close("form-generator-form"),
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
    },
  };

  return modalRegistry;
};

export default useModalRegistry;
