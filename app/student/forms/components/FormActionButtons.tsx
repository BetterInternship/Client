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
      <div className="flex flex-row gap-2">
        <Button
          size="lg"
          className="w-full sm:w-auto text-lg"
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
          className="w-full sm:w-auto text-lg"
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
        className="h-auto p-0 sm:text-base"
        onClick={handlePrintForWetSignature}
      >
        or print for wet signature instead
      </Button>
    </>
  );
};
