/**
 * @ Author: BetterInternship
 * @ Create Time: 2026-03-04 16:35:00
 * @ Modified time: 2026-03-24 14:31:23
 * @ Description:
 *
 * Client process implementation for the form fillout process
 */

import { useMyForms } from "@/app/student/forms/myforms.ctx";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormService } from "@/lib/api/services";
import { useClientProcess } from "@betterinternship/components";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

const formFilloutKey = "form-fillout";

interface FilloutFormProcessResult {
  formId: string;
  formProcessId: string;
  downloadUrl: string;
}

export const useFormFilloutProcessRunner = () => {
  const myForms = useMyForms();
  const form = useFormRendererContext();

  return useClientProcess({
    filterKey: formFilloutKey,
    caller: FormService.filloutForm.bind(FormService),
    invalidator: useCallback(
      (result: FilloutFormProcessResult) => {
        const retval = myForms.forms.some(
          (form) => form.form_process_id === result.formProcessId,
        );
        console.log(
          `INVALIDATION check for ${result.formId} ${result.formProcessId}`,
          retval,
        );
        return retval;
      },
      [myForms.forms],
    ),
    onSuccess: (processId, _processName, result) => {
      toast.success(`Generated ${form.formLabel}!`, {
        id: processId,
        duration: 2000,
      });
      console.log("FILLOUT FORM RESULT: ", result);
    },
    onFailure: (processId, _processName, error) => {
      toast.error(`Could not generate ${form.formLabel}: ${error}`, {
        id: processId,
        duration: 2000,
      });
      console.log("FILLOUT FORM ERROR: ", error);
    },
  });
};

export const useFormFilloutProcessReader = () => {
  return useClientProcess({ filterKey: formFilloutKey });
};

export const useFormFilloutProcessPending = () => {
  const myForms = useMyForms();
  const formFilloutProcessReader = useFormFilloutProcessReader();

  return useMemo(
    () =>
      formFilloutProcessReader.getAllPending().map((pendingForm) => ({
        label: pendingForm.metadata?.metadata?.label ?? "",
        timestamp: pendingForm.metadata?.metadata?.timestamp ?? "",
        pending: true,
      })),
    [myForms.forms],
  );
};

export const useFormFilloutProcessHandled = () => {
  const myForms = useMyForms();
  const formFilloutProcessReader = useFormFilloutProcessReader();

  return useMemo(
    () =>
      formFilloutProcessReader
        .getAllHandled()
        .filter((handledForm) =>
          myForms.forms.every(
            (form) =>
              form.form_process_id !==
              (handledForm.result as FilloutFormProcessResult).formProcessId,
          ),
        )
        .map((handledForm) => ({
          label: handledForm.metadata?.metadata?.label ?? "",
          timestamp: handledForm.metadata?.metadata?.timestamp ?? "",
          downloadUrl: (handledForm.result as FilloutFormProcessResult)
            .downloadUrl,
          pending: false,
          status: "done",
        })),
    [myForms.forms],
  );
};
