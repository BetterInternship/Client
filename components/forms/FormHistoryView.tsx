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
    form_process_id: string;
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    signing_parties?: IFormSigningParty[];
    status?: string | null;
    rejection_reason?: string;
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
      <Separator className="mt-4" />

      <div className="animate-fade-in">
        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-600">No forms yet</p>
            <p className="text-sm text-gray-500 mt-1">
              You haven't generated any forms yet. Create your first form to get
              started!
            </p>
          </div>
        ) : (
          forms
            .toSorted(
              (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
            )
            .map((form) => (
              <FormLog
                formProcessId={form.form_process_id}
                key={form.timestamp}
                label={form.label}
                documentId={
                  form.signed_document_id ?? form.prefilled_document_id
                }
                timestamp={formatDate(form.timestamp)}
                downloadUrl={form.latest_document_url}
                signingParties={form.signing_parties}
                status={form.status}
                rejectionReason={form.rejection_reason}
              />
            ))
        )}
      </div>
    </div>
  );
}
