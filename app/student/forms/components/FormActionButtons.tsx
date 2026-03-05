import { Eye, PenLineIcon } from "lucide-react";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { Button } from "@/components/ui/button";
import useModalRegistry from "@/components/modals/modal-registry";

export const FormActionButtons = ({
  handleSignViaBetterInternship,
  handlePrintForWetSignature,
}: {
  handleSignViaBetterInternship: () => void;
  handlePrintForWetSignature: () => void;
}) => {
  const form = useFormRendererContext();
  const modalRegistry = useModalRegistry();
  const recipients = form.formMetadata.getSigningParties();

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="w-full text-lg sm:w-auto"
          variant="outline"
          onClick={() => {
            if (form.document.url) {
              modalRegistry.previewFormPdf.open({
                documentUrl: form.document.url,
              });
            } else {
              alert("No document url provided for preview.");
            }
          }}
        >
          <Eye className="w-5 h-5" />
          Preview PDF
        </Button>
        <Button
          size="lg"
          className="w-full text-lg sm:w-auto"
          onClick={handleSignViaBetterInternship}
        >
          <PenLineIcon className="w-5 h-5" />
          {recipients.some(
            (recipient) => recipient.signatory_source?._id === "initiator",
          )
            ? "Sign via BetterInternship"
            : "Fillout Document"}
        </Button>
      </div>
      <Button
        variant="link"
        className="h-auto w-full justify-start p-0 text-left sm:w-auto sm:text-base"
        onClick={handlePrintForWetSignature}
      >
        or print for wet signature instead
      </Button>
    </>
  );
};
