"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How much does it cost to post on BetterInternship?",
    answer:
      "Nothing. BetterInternship is completely free for companies to post positions and for students to apply.",
  },
  {
    question: "How is BetterInternship different from other job sites?",
    answer:
      "We focus solely on internships in the Philippines. We partner with universities to bridge the gap between student talent and top companies seamlessly.",
  },
];

export function FAQsSection() {
  return (
    <section className="relative flex justify-center items-center overflow-hidden px-8 py-48">
      <div className="flex flex-col gap-4 max-w-7xl w-full">
        <div className="flex gap-4 items-center">
          <HelpCircle className="w-8 h-8" />
          <h2>
            Frequently asked <span className="text-primary">questions</span>
          </h2>
        </div>

        <Accordion
          type="multiple"
          className="w-full rounded-[0.33em] border px-6"
        >
          {faqItems.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-xl tracking-tighter font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
