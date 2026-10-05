"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@betterinternship/components";
import { homepageFaqs } from "./homepage-data";

export function HomepageFaq() {
  return (
    <Accordion type="single" collapsible className="home-faq-list">
      {homepageFaqs.map((faq, index) => (
        <AccordionItem
          className="home-faq-item"
          value={`faq-${index}`}
          key={faq.question}
        >
          <AccordionTrigger className="home-faq-trigger">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="home-faq-answer">
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
