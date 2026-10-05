import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { termsMarkdown } from "@/components/legal/terms-text";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function StudentTermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      subtitle="Effective May 1, 2025"
      content={termsMarkdown}
    />
  );
}
