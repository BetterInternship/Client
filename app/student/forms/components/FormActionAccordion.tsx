import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormActionButtons } from "./FormActionButtons";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";

export const FormActionAccordion = ({
  handleSignViaBetterInternship,
  handlePrintForWetSignature,
}: {
  handleSignViaBetterInternship: () => void;
  handlePrintForWetSignature: () => void;
}) => {
  const form = useFormRendererContext();
  const recipients = form.formMetadata.getSigningParties();
  const requiresSignatures = recipients.some(
    (recipient) => recipient.signatory_source?._id === "initiator",
  );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="generate-another">
        <AccordionTrigger className="text-xl px-6 font-semibold text-gray-800 hover:no-underline bg-white aria-expanded:rounded-b-none border-gray-300 border">
          Generate another
        </AccordionTrigger>
        <AccordionContent className="bg-white p-6 rounded-b-[0.33em] border-gray-300 border border-t-0">
          {requiresSignatures ? (
            <FormSigningPartyTimeline />
          ) : (
            <div className="text-xl text-gray-700 font-bold">
              This form does not require any signatures.
            </div>
          )}
          <div className="mt-8 flex w-full flex-col items-stretch gap-1 ">
            <FormActionButtons
              handleSignViaBetterInternship={handleSignViaBetterInternship}
              handlePrintForWetSignature={handlePrintForWetSignature}
              align="end"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
