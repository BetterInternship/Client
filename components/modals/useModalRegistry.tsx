import { useQueryClient } from "@tanstack/react-query";
import { useGlobalModal } from "../providers/ModalProvider";

import { IncompleteProfileContent } from "./components/IncompleteProfileModal";
import { MassApplyComposer } from "./components/MassApplyComposer";
import {
  MassApplyResults,
  MassApplyResultsData,
} from "./components/MassApplyResults";
import { SpecifySigningPartiesModal } from "./components/SpecifySigningPartiesModal";
import { ClientBlock } from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";

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
        signingPartyBlocks: ClientBlock<[PublicUser]>[],
        handleSubmit: () => Promise<any>,
      ) =>
        open(
          "specify-signing-parties",
          <SpecifySigningPartiesModal
            signingPartyBlocks={signingPartyBlocks}
            handleSubmit={handleSubmit}
            close={() => close("specify-signing-parties")}
          />,
          {
            title: "Next Signing Parties",
            showHeaderDivider: true,
          },
        ),
      close: () => close("specify-signing-parties"),
    },
  };

  return modalRegistry;
};

export default useModalRegistry;
