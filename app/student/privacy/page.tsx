import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacyMarkdown } from "@/components/legal/privacy-text";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function StudentPrivacyPage() {
  return <LegalDocument title="Privacy Policy" content={privacyMarkdown} />;
}
