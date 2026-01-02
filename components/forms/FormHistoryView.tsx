"use client";

import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FormLog } from "./FormLog";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { formatDate } from "@/lib/utils";

interface FormHistoryViewProps {
  forms: Array<{
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    signing_parties?: IFormSigningParty[];
  }>;
}

/**
 * Form History View
 */
export function FormHistoryView({ forms }: FormHistoryViewProps) {
  return (
    <div className="container max-w-5xl pt-8 mx-auto overflow-y-auto h-full">
      <div className="animate-fade-in">
        <div className="flex flex-row items-center gap-3 mb-2">
          <HeaderIcon icon={Newspaper}></HeaderIcon>
          <HeaderText>Form History</HeaderText>
        </div>
        <Badge>{forms.length} generated forms</Badge>
      </div>
      <Separator className="mt-8" />

      <div className="animate-fade-in">
        {forms
          .toSorted((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
          .map((form) => (
            <FormLog
              key={form.id}
              label={form.label}
              documentId={form.signed_document_id ?? form.prefilled_document_id}
              timestamp={formatDate(form.timestamp)}
              downloadUrl={form.latest_document_url}
              signingParties={form.signing_parties}
            />
          ))}
      </div>
    </div>
  );
}
