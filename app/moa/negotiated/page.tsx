"use client";

import { useRouter } from "next/navigation";
import { Card } from "../components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormCheckbox, FormInput } from "@/components/EditForm";
import { useRef, useState } from "react";
import {
  FileUploadInput,
  IFileUploadRef,
  useFileUpload,
} from "@/hooks/use-file";
import { File, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const {
    fileInputRef: moaInputRef,
    upload: moaUpload,
    isUploading: moaIsUploading,
  } = useFileUpload({
    uploader: async () => {},
    filename: "moa",
  });

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Negotiated MOA Request
      </div>
      <div className="text-gray-700 text-xl">
        Submit your custom MOA proposal with detailed justification for
        non-standard terms.
      </div>

      <div className="max-w-2xl flex flex-col justify-left items-start gap-8">
        <label className="w-full text-xs text-gray-400 italic block mb-[-24]">
          Attach Proposed MOA Document <span className="text-red-500">*</span>
        </label>
        <Button
          scheme="secondary"
          className="w-full h-fit p-0"
          onClick={() => moaInputRef.current?.open()}
        >
          <Card className="w-full">
            <div className="flex flex-col items-center justify-center gap-4">
              <File className="!w-16 !h-16 text-gray-500" />
              <div>Drop your MOA document here or click to browse</div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <FileUploadInput
                ref={moaInputRef}
                allowedTypes={["image/jpeg", "image/png", "image/webp"]}
                maxSize={1}
                onSelect={() => {}}
              />
            </div>
          </Card>
        </Button>

        <label className="text-xs text-gray-400 italic block mb-[-24]">
          Reason for Custom Terms <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          placeholder="Please explain why you need custom terms and how they differ from our standard MOA template. Include specific clauses, duration requirements, or partnership scope details..."
          className="w-full max-w-xl border border-gray-200 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
          maxLength={1000}
        />
        <Card className="border-warning p-4">
          <div className="flex flex-col gap-2">
            <Badge type="warning" className="w-fit">
              Processing time: 2-4 weeks
            </Badge>
            <div className="text-warning italic">
              Custom MOA requests require detailed review by our legal team.
            </div>
          </div>
        </Card>
      </div>
      <Button
        disabled={!reason}
        scheme="primary"
        size="lg"
        onClick={() => router.push("/negotiated")}
      >
        Submit MOA Request
      </Button>
    </div>
  );
}
