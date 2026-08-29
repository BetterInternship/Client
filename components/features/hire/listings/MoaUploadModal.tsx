"use client";

import { Button } from "@betterinternship/components";
import { FileUp, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { toast } from "sonner";
import { useMoaUniversities } from "@/hooks/use-employer-api";
import Link from "next/link";
import { env } from "process";

interface MoaUploadModalProps {
  onDone?: () => void;
  onCancel?: () => void;
}

const REQUIRED_DOCS = [
  {
    key: "sec_dti_registration",
    label: "SEC/DTI Registration",
    hint: "Certificate of registration",
  },
  {
    key: "mayor_permit",
    label: "Mayor's Permit",
    hint: "Business permit from LGU",
  },
  {
    key: "bir_2303",
    label: "BIR 2303",
    hint: "Certificate of Registration",
  },
] as const;

export const MoaUploadModal = ({ onDone, onCancel }: MoaUploadModalProps) => {
  const posthog = usePostHog();
  const { refetch } = useMoaUniversities();
  const [files, setFiles] = useState<Record<string, File | null>>({
    sec_dti_registration: null,
    mayor_permit: null,
    bir_2303: null,
  });
  const [uploading, setUploading] = useState(false);

  const docCount = Object.values(files).filter(Boolean).length;
  const allSelected = docCount === 3;

  const handleFile = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    if (file) {
      posthog.capture("hire_moa_document_selected", {
        type: key,
        source: "create_listing_setup",
      });
    }
  };

  const handleSubmit = async () => {
    if (!allSelected) {
      toast.error("Please select all 3 PDFs");
      return;
    }
    setUploading(true);
    posthog.capture("hire_moa_upload_started", {
      source: "create_listing_setup",
      document_count: docCount,
    });

    // In a full implementation this would POST to Career proxy
    // POST employer/moa-documents or directly to IOM /api/company/documents.
    // For now we simulate success and guide to IOM verification.
    await new Promise((r) => setTimeout(r, 900));

    posthog.capture("hire_moa_upload_completed", {
      source: "create_listing_setup",
      document_count: docCount,
    });

    toast.success(
      "Documents received — they'll be verified shortly. You can queue MOA requests meanwhile.",
    );

    // Refresh MOA state so inline card flips to pending/success
    refetch();

    setUploading(false);
    onDone?.();
  };

  return (
    <div className="space-y-4">
      <div className="mt-4">
        Upload the 3 CHED-required PDFs once. MOAs issue instantly once
        verified, and you can queue requests while pending.
      </div>

      <div className="grid gap-3">
        {REQUIRED_DOCS.map((doc) => {
          const file = files[doc.key];
          const hasFile = !!file;
          return (
            <label
              key={doc.key}
              className={`flex items-center gap-3 p-3 border rounded-[0.33em] cursor-pointer transition-colors ${
                hasFile
                  ? "border-primary/40 bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  hasFile
                    ? "bg-supportive/10 text-supportive"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {hasFile ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {file ? file.name : doc.hint + " — PDF only"}
                </p>
              </div>
              <span className="text-xs font-medium text-primary shrink-0">
                {hasFile ? "Replace" : "Upload PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  handleFile(doc.key, e.target.files?.[0] ?? null)
                }
              />
            </label>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0" />
        PDFs are stored securely and reviewed by BetterInternship. You can
        request MOAs while pending — they’ll issue automatically after approval.
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!allSelected || uploading}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" />
              Upload {docCount}/3
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Already verified on the Partners Portal?{" "}
        <span className="text-primary font-medium">
          <Link href={`${env.NEXT_PUBLIC_CLIENT_HIRE_URL}/account?tab=company`}>
            Link your account in Account → Company
          </Link>
        </span>{" "}
        instead.
      </p>
    </div>
  );
};

export default MoaUploadModal;
