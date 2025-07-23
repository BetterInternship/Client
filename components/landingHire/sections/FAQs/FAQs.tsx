import { Check, PhoneCall } from "lucide-react";
import { Badge } from "@/components/landingHire/sections/FAQs/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/landingHire/sections/FAQs/accordion";
import { Button } from "@/components/ui/button";

function FAQ() {
  return (
    <div className="w-full py-20 lg:py-40 dark border-t border-gray-900 dark:bg-black dark:text-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">FAQ</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h4 className="text-5xl md:text-7xl tracking-tighter max-w-xl text-left text-white font-regular">
                  FAQs Section
                </h4>
              </div>
              <div>
                <Button
                  asChild
                  variant="outline"
                  className="inline-flex items-center gap-4 border-white text-white hover:bg-white hover:text-black transition-colors"
                >
                  <a
                    href="https://calendar.app.google/EF3XRLuEti5ac63c8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Any questions? Book a Demo <PhoneCall className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full text-white text-left">
            {[
              {
                question: "How much does it cost to post on BetterInternship?",
                answer:
                  "Nothing. BetterInternship is completely free for companies to post and for students to apply.",
              },
              {
                question: "What makes BetterInternship different from other job sites?",
                answer:
                  "We focus solely on internships in the Philippines. From one-click interview scheduling to instant messaging and paperwork management, we streamline the entire internship process for both students and companies.",
              },
              {
                question: "Who runs BetterInternship?",
                answer:
                  "It’s built and maintained by students from the Misfit Community in DLSU.",
              },
              {
                question: "Is BetterInternship officially affiliated with DLSU?",
                answer:
                  "No. BetterInternship is only officially endorsed by DLSU College of Computer Studies as of this moment.",
              },
              {
                question: "Can any company use BetterInternship?",
                answer:
                  "Yes, but all company accounts must be verified by our admins before posting.",
              },
            ].map((item, index) => (
              <AccordionItem key={index} value={"index-" + index}>
                <AccordionTrigger className="text-white">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export { FAQ };
