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
                <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left text-white font-regular">
                  Got Questions?
                </h4>
                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-white  text-left">
                  Running a business comes with enough challenges. We help
                  you skip the hassle of old-school processes and paperwork. Our
                  platform makes hiring interns simple, efficient, and stress-free.
                </p>
              </div>
              <div className="">
                <Button className="gap-4 text-white" variant="outline">
                  Any questions? Book a Demo <PhoneCall className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full text-white">
            {[
              {
                question: "How does the matching process work?",
                answer:
                  "We use a combination of AI and human review to match interns with businesses based on skills, interests, and availability.",
              },
              {
                question: "Is there a fee for posting internships?",
                answer:
                  "Posting internships is free for small businesses. Premium features are available for a fee.",
              },
              {
                question: "Can I edit my internship posting?",
                answer:
                  "Yes, you can edit or update your posting at any time from your dashboard.",
              },
              {
                question: "What paperwork do you handle?",
                answer:
                  "We handle contracts, NDAs, onboarding documents, and scheduling to save you time.",
              },
              {
                question: "How do I contact support?",
                answer:
                  "You can reach out via our contact form or use the chat feature in your dashboard for instant help.",
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
