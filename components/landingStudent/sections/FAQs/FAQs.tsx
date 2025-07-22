import { Check, PhoneCall } from "lucide-react";
import { Badge } from "@/components/landingStudent/sections/FAQs/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/landingStudent/sections/FAQs/accordion";
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
                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-white text-left">
                  Looking for an internship can be overwhelming. We make it easy
                  for students to find, apply, and get hired for internships that
                  match their interests and skills. Get support every step of the
                  way.
                </p>
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
                    Need help? Book a Call{" "}
                    <PhoneCall className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full text-white">
            {[
              {
                question: "How do I find internships?",
                answer:
                  "Browse available internships on our platform and filter by your interests, skills, or location. Apply directly with your profile.",
              },
              {
                question: "Is it free to use the platform?",
                answer:
                  "Yes, searching and applying for internships is completely free for students.",
              },
              {
                question: "Can I update my application?",
                answer:
                  "You can edit your profile and application details anytime from your dashboard.",
              },
              {
                question: "What documents do I need?",
                answer:
                  "You can upload your resume, cover letter, and any other required documents directly to your application.",
              },
              {
                question: "How do I get support?",
                answer:
                  "Reach out to us at hello@betterinternship.com or book a call for personalized help.",
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
