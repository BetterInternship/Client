"use client";

import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FormLog } from "./FormLog";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAppContext } from "@/lib/ctx-app";
import { useMemo } from "react";

interface FormHistoryViewProps {
  formLabel?: string;
  forms: Array<{
    form_process_id?: string;
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    signing_parties?: IFormSigningParty[];
    status?: string | null;
    rejection_reason?: string;
    pending?: boolean;
  }>;
}

/**
 * Form History View
 */
export function FormHistoryView({ forms, formLabel }: FormHistoryViewProps) {
  const filteredForms = useMemo(
    () => forms.filter((form) => form.label === formLabel || !formLabel),
    [forms, formLabel],
  );

  return (
    <div className="w-full mx-auto">
      <div className="animate-fade-in">
        {filteredForms.length === 0 ? (
          <></>
        ) : (
          filteredForms
            .toSorted(
              (a, b) =>
                Date.parse(b.timestamp ?? "") - Date.parse(a.timestamp ?? ""),
            )
            .map((form, index) => (
              <FormLog
                formProcessId={form.form_process_id}
                key={form.timestamp}
                label={form.label}
                timestamp={formatDate(form.timestamp)}
                downloadUrl={form.latest_document_url}
                signingParties={form.signing_parties}
                status={form.status}
                rejectionReason={form.rejection_reason}
                index={index}
                pending={form.pending}
              />
            ))
        )}
      </div>
    </div>
  );
}
