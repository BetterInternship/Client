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
          <Accordion type="single" collapsible className="w-full text-white">
            {[
              {
                question: "How does the matching process work?",
                answer:
                  "Post your internship and receive applications from talented applicants. Our dashboard makes it easy to review candidates and manage applications.",
              },
              {
                question: "Is it free to post internships?",
                answer:
                  "Yes, posting internships and using all platform features is completely free.",
              },
              {
                question: "Can I update my internship listing?",
                answer:
                  "Yes, you can edit or update your internship details anytime from your dashboard.",
              },
              {
                question: "What paperwork can you handle?",
                answer:
                  "We handle contracts, MOAs, onboarding documents, and scheduling, so you can focus on hiring.",
              },
              {
                question: "How can I get support?",
                answer:
                  "Contact us at hello@betterinternship.com for quick assistance from our team.",
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
