import { Eye, PenLineIcon, Printer } from "lucide-react";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { Button } from "@/components/ui/button";
import useModalRegistry from "@/components/modals/modal-registry";
import { cn } from "@/lib/utils";

export const FormActionButtons = ({
  handleSignViaBetterInternship,
  handlePrintForWetSignature,
  align = "start",
}: {
  handleSignViaBetterInternship: () => void;
  handlePrintForWetSignature: () => void;
  align?: "start" | "end";
}) => {
  const form = useFormRendererContext();
  const modalRegistry = useModalRegistry();
  const recipients = form.formMetadata.getSigningParties();

  return (
    <>
      <div
        className={cn(
          "flex w-full flex-col gap-2 sm:flex-row",
          align === "end" ? "sm:justify-end" : "",
        )}
      >
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
        className={cn(
          "text-left text-xs text-gray-500 hover:bg-transparent hover:text-primary sm:w-auto sm:text-sm p-0",
          align === "end" ? "sm:ml-auto" : "",
        )}
        onClick={handlePrintForWetSignature}
      >
        <Printer className="h-4 w-4" />
        or print for wet signature instead
      </Button>
    </>
  );
};
