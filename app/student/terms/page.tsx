"use client";

import { LegalDocument } from "@/components/legal/legal-document";
import { termsMarkdown } from "@/components/legal/terms-text";

export default function StudentTermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      subtitle="Effective May 1, 2025"
      content={termsMarkdown}
    />
  );
}
