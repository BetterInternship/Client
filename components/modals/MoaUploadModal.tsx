"use client";

import { Button } from "@betterinternship/components";
import { FileUp, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { toast } from "sonner";
import { EmployerService } from "@/lib/api/services";

interface MoaUploadModalProps {
  onDone?: () => void;
  onCancel?: () => void;
}

export const MoaUploadModal = ({ onDone, onCancel }: MoaUploadModalProps) => {
  const posthog = usePostHog();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (selected: File | null) => {
    setFile(selected);
    if (selected) {
      posthog.capture("hire_moa_document_selected", {
        type: "moa_pdf",
        source: "create_listing_setup",
      });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }
    setUploading(true);
    posthog.capture("hire_moa_upload_started", {
      source: "create_listing_setup",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await EmployerService.uploadMoaDocument(formData);

      if (result.error) {
        toast.error(result.error || "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      posthog.capture("hire_moa_upload_completed", {
        source: "create_listing_setup",
      });

      toast.success(
        "MOA document submitted for review. You'll be notified once verified.",
      );

      setUploading(false);
      onDone?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mt-4">
        Upload your Memorandum of Agreement (MOA) as a single PDF. We will
        review your document before approval.
      </div>

      <label
        className={`flex items-center gap-3 p-3 border rounded-[0.33em] cursor-pointer transition-colors ${
          file
            ? "border-primary/40 bg-primary/5"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
      >
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
            file
              ? "bg-supportive/10 text-supportive"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {file ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">MOA Document</p>
          <p className="text-xs text-muted-foreground truncate">
            {file ? file.name : "Select a PDF file (max 10MB)"}
          </p>
        </div>
        <span className="text-xs font-medium text-primary shrink-0">
          {file ? "Replace" : "Upload PDF"}
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0" />
        PDFs are stored securely and reviewed by BetterInternship.
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
          disabled={!file || uploading}
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
              Upload MOA
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MoaUploadModal;
