"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from "@betterinternship/components";
import type { ReactNode } from "react";

export type FaqItem = { question: string; answer: ReactNode };

export function FaqList({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("border-t border-[#e6eaf1]", className)}
    >
      {items.map((faq, index) => (
        <AccordionItem
          className="border-b border-[#e6eaf1]"
          value={`faq-${index}`}
          key={faq.question}
        >
          <AccordionTrigger className="flex min-h-14 w-full items-center justify-between gap-5 rounded-none py-5 text-left text-base font-[550] leading-[1.5] text-landing-navy transition-colors duration-[160ms] hover:text-landing-secondary-deep hover:no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue max-md:py-4.5 max-md:text-sm motion-reduce:[&>svg]:transition-none [&>svg]:shrink-0 [&>svg]:text-landing-secondary">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-[1.75] text-landing-muted motion-reduce:animate-none">
            <p className="m-0 max-w-[85ch] text-sm leading-[1.75] text-landing-muted">
              {faq.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
