"use client";

import useModalRegistry from "@/components/modals/modal-registry";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormRendererContext } from "./form-renderer.ctx";
import { useState } from "react";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofillUpdate, useMyAutofill } from "@/hooks/use-my-autofill";
import { useProfileData } from "@/lib/api/student.data.api";
import { FormService } from "@/lib/api/services";
import { TextLoader } from "@/components/ui/loader";
import { FormValues } from "@betterinternship/core/forms";
import { useQueryClient } from "@tanstack/react-query";
import { getClientAudit } from "@/lib/audit";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { useSignContext } from "@/components/providers/sign.ctx";
import { CircleHelp } from "lucide-react";

export function FormActionButtons() {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const profile = useProfileData();
  const modalRegistry = useModalRegistry();
  const updateAutofill = useMyAutofillUpdate();
  const signContext = useSignContext();
  const queryClient = useQueryClient();

  const noEsign = !form.formMetadata.mayInvolveEsign();
  const initiateFormLabel = "Sign via BetterInternship";
  const filloutFormLabel = !noEsign ? "Print for Wet Signature" : "Print form";

  const [busy, setBusy] = useState<boolean>(false);
  const onWithoutEsignClick = () => void handleSubmit(false);
  const onWithEsignClick = () => void handleSubmit(true);

  /**
   * This submits the form to the server
   * @param withEsign - if true, enables e-sign; if false, does prefill
   * @param _bypassConfirm - internal flag to skip recipient confirmation on re-call
   * @returns
   */
  const handleSubmit = async (withEsign?: boolean) => {
    setBusy(true);
    if (!profile.data?.id) return;

    // Validate fields before allowing to proceed
    const finalValues = formFiller.getFinalValues(autofillValues);
    const errors = formFiller.validate(form.fields, autofillValues);

    if (Object.keys(errors).length) {
      toast.error(
        "Some information is missing or incorrect",
        toastPresets.destructive,
      );
      setBusy(false);
      return;
    }

    // proceed to save + submit
    try {
      setBusy(true);

      // Update autofill afterwards (so even if it fails, autofill is there)
      await updateAutofill(form.formName, form.fields, finalValues);

      // Iniate e-sign
      if (withEsign) {
        // Check if other parties need to be requested from
        const signingPartyBlocks =
          form.formMetadata.getSigningPartyBlocks("initiator");

        // Open request for contacts
        if (signingPartyBlocks.length) {
          modalRegistry.specifySigningParties.open(
            form.fields,
            formFiller,
            signingPartyBlocks,
            (signingPartyValues: FormValues) =>
              FormService.initiateForm({
                formName: form.formName,
                formVersion: form.formVersion,
                values: { ...finalValues, ...signingPartyValues },
                audit: getClientAudit(),
              }),
            autofillValues,
            form.formMetadata.getSigningParties(),
          );

          // Just e-sign and fill-out right away
        } else {
          const response = await FormService.initiateForm({
            formName: form.formName,
            formVersion: form.formVersion,
            values: finalValues,
            audit: getClientAudit(),
          });

          if (!response.success) {
            setBusy(false);
            alert("Something went wrong, please try again.");
            console.error(response.message);
            return;
          }

          await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
          modalRegistry.formSubmissionSuccess.open("esign");
        }

        // Just fill out form
      } else {
        const response = await FormService.filloutForm({
          formName: form.formName,
          formVersion: form.formVersion,
          values: finalValues,
        });

        if (!response.success) {
          setBusy(false);
          alert("Something went wrong, please try again.");
          console.error(response.message);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ["my-forms"] });

        modalRegistry.formSubmissionSuccess.open("manual");
      }

      setBusy(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-row items-stretch gap-2 w-full sm:w-auto sm:justify-end">
        {noEsign ? (
          <Button
            onClick={onWithoutEsignClick}
            variant="default"
            className="w-full sm:w-auto text-xs"
            disabled={busy || !signContext.hasAgreed}
          >
            <TextLoader loading={busy}>
              <div className="flex items-center gap-1.5">
                <span className="sm:hidden">Fill out</span>
                <span className="hidden sm:inline">{filloutFormLabel}</span>
              </div>
            </TextLoader>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onWithoutEsignClick}
                variant="default"
                className="w-full sm:w-auto text-xs"
                disabled={busy || !signContext.hasAgreed}
              >
                <TextLoader loading={busy}>
                  <div className="flex items-center gap-1.5">
                    <span className="sm:hidden">Manual</span>
                    <span className="hidden sm:inline">{filloutFormLabel}</span>
                    <CircleHelp className="w-2 h-2 opacity-50" />
                  </div>
                </TextLoader>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium max-w-xs text-justify">
              You’ll complete the form and sign it by hand after printing.
            </TooltipContent>
          </Tooltip>
        )}

        {!noEsign && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onWithEsignClick}
                className="w-full sm:w-auto text-xs"
                disabled={busy || !signContext.hasAgreed}
              >
                <TextLoader loading={busy}>
                  <div className="flex items-center gap-1.5">
                    <span className="sm:hidden">E-Sign</span>
                    <span className="hidden sm:inline">
                      {initiateFormLabel}
                    </span>
                    <CircleHelp className="w-2 h-2 opacity-50" />
                  </div>
                </TextLoader>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium max-w-xs text-justify">
              Start an online signing process through BetterIntership. We’ll
              email all required parties and let you track progress, 10× faster.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
