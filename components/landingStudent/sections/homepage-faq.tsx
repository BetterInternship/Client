import { FaqList } from "@/components/landing/faq-list";
import { homepageFaqs } from "../homepage-data";

export function HomepageFaq() {
  return <FaqList items={homepageFaqs} />;
}
