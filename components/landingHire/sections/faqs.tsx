"use client";

import { BellDot, HelpCircle, MessageCircleHeart, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeaderIcon } from "@/components/ui/text";

const faqItems = [
  {
    question: "How much does it cost to post on BetterInternship?",
    answer:
      "Nothing. BetterInternship is completely free for companies to post positions and for students to apply.",
  },
  {
    question: "How is BetterInternship different from other job sites?",
    answer:
      "We focus solely on internships in the Philippines. Instead of a generic job board, we partner directly with universities to bridge the gap between student talent and top companies seamlessly.",
  },
  {
    question: "Who runs BetterInternship?",
    answer:
      "It’s proudly built and maintained by students from the Misfits Community in DLSU.",
  },
  {
    question: "Is BetterInternship operated by DLSU?",
    answer:
      "No. While our team is from DLSU, BetterInternship is an independent platform that seeks to partner with all universities across the country, rather than being operated by any single institution.",
  },
  {
    question: "Is BetterInternship exclusive to DLSU students?",
    answer:
      "No. Any student currently enrolled in a Philippine university or college can join, giving you access to a diverse pool of nationwide talent.",
  },
];

export function FAQsSection() {
  return (
    <section className="relative min-h-screen flex justify-center items-center overflow-hidden px-8">
      <div className="flex flex-col gap-4 max-w-7xl w-full">
        <div className="flex gap-4 items-center">
          <HelpCircle className="w-8 h-8" />
          <h1>FAQs</h1>
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
