import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormActionButtons } from "./FormActionButtons";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";

export const FormActionAccordion = ({
  handleSignViaBetterInternship,
  handlePrintForWetSignature,
}: {
  handleSignViaBetterInternship: () => void;
  handlePrintForWetSignature: () => void;
}) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="generate-another">
        <AccordionTrigger className="text-xl px-6 font-semibold text-gray-800 hover:no-underline bg-gray-50 aria-expanded:rounded-b-none border-gray-300 border">
          Generate another
        </AccordionTrigger>
        <AccordionContent className="p-6 rounded-b-[0.33em] border-gray-300 border border-t-0">
          <FormSigningPartyTimeline />
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
