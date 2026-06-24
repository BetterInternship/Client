"use client";

import { LegalDocument } from "@/components/legal/legal-document";
import { privacyMarkdown } from "@/components/legal/privacy-text";

export default function StudentPrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      content={privacyMarkdown}
    />
  );
}
