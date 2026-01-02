"use client";

import useModalRegistry from "@/components/modals/modal-registry";
import { Button } from "@/components/ui/button";
import { useFormRendererContext } from "./form-renderer.ctx";
import { useState } from "react";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofillUpdate, useMyAutofill } from "@/hooks/use-my-autofill";
import { useProfileData } from "@/lib/api/student.data.api";
import { FormService } from "@/lib/api/services";
import { TextLoader } from "@/components/ui/loader";
import { FormValues } from "@betterinternship/core/forms";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getClientAudit } from "@/lib/audit";

export function FormActionButtons() {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const profile = useProfileData();
  const modalRegistry = useModalRegistry();
  const updateAutofill = useMyAutofillUpdate();
  const queryClient = useQueryClient();
  const router = useRouter();

  const noEsign = !form.formMetadata.mayInvolveEsign();
  const initiateFormLabel = "Fill out & initiate e-sign";
  const filloutFormLabel = !noEsign
    ? "Fill out for manual signing"
    : "Fill out form";

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
    console.log(errors);

    if (Object.keys(errors).length) return setBusy(false);

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
          );

          // Just e-sign and fill-out right away
        } else {
          await FormService.initiateForm({
            formName: form.formName,
            formVersion: form.formVersion,
            values: finalValues,
            audit: getClientAudit(),
          });

          await queryClient.invalidateQueries({ queryKey: ["my_forms"] });
          router.push("/forms");
        }

        // Just fill out form
      } else {
        await FormService.filloutForm({
          formName: form.formName,
          formVersion: form.formVersion,
          values: finalValues,
        });

        await queryClient.invalidateQueries({ queryKey: ["my_forms"] });
        router.push("/forms");
      }

      setBusy(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-start justify-end gap-2">
      <Button
        onClick={onWithoutEsignClick}
        variant={noEsign ? "default" : "outline"}
        className="w-full sm:w-auto text-xs"
        disabled={busy}
      >
        <TextLoader loading={busy}>{filloutFormLabel}</TextLoader>
      </Button>

      {!noEsign && (
        <Button
          onClick={onWithEsignClick}
          className="w-full sm:w-auto text-xs"
          disabled={busy}
        >
          <TextLoader loading={busy}>{initiateFormLabel}</TextLoader>
        </Button>
      )}
    </div>
  );
}
