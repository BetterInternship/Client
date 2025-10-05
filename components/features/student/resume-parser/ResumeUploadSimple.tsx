"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ProcessingTransition } from "./ProcessingTransition";
import { UploadIcon } from "lucide-react";
import { UserService } from "@/lib/api/services";

type Props = {
  onSelected?: (file: File | null) => void;
  onUploaded?: () => void;
  onError?: (msg: string) => void;
  accept?: string;
  maxSizeMB?: number;
};

const ResumeUploadSimple = ({
  onSelected,
  onUploaded,
  onError,
  accept = ".pdf,application/pdf",
  maxSizeMB = 5,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null); // <-- internal ref
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [pendingPromise, setPendingPromise] = useState<
    Promise<any> | undefined
  >(undefined);

  const triggerFileDialog = () => inputRef.current?.click();

  const handleChosenFile = async (f?: File | null) => {
    onSelected?.(f ?? null);
    if (!f) return;

    // size check
    if (f.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File must be ≤ ${maxSizeMB}MB.`);
      reset();
      return;
    }
    // type check
    const allowed = accept.split(",").map((s) => s.trim().toLowerCase());
    const nameOk = allowed.some(
      (a) => a.startsWith(".") && f.name.toLowerCase().endsWith(a)
    );
    const mimeOk = allowed.some(
      (a) => !a.startsWith(".") && f.type.toLowerCase() === a
    );
    if (!(nameOk || mimeOk)) {
      onError?.("Please upload a PDF file.");
      reset();
      return;
    }

    // upload to DB (no parsing)
    const form = new FormData();
    form.append("resume", f);

    const p = UserService.updateMyResume(form);
    setPendingPromise(p);
    setUploading(true);

    try {
      const res = await p;
      if ((res as any)?.success === false) throw new Error("Upload failed.");
      onUploaded?.();
    } catch (e: any) {
      onError?.(e?.message || "Upload failed.");
    } finally {
      setUploading(false);
      reset();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChosenFile(e.target.files?.[0] ?? null);
  };

  const reset = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  // DnD handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleChosenFile(f);
  };

  return (
    <AnimatePresence>
      {uploading ? (
        <ProcessingTransition
          promise={pendingPromise}
          onComplete={() => onUploaded?.()}
        />
      ) : (
        <div className="flex flex-col items-center w-full mx-auto">
          <div
            className={
              "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[0.33em] cursor-pointer transition-colors " +
              (isDragging
                ? "border-primary bg-primary/5"
                : "border-[#94A3B8] hover:border-primary")
            }
            onClick={triggerFileDialog}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && triggerFileDialog()
            }
          >
            <UploadIcon className="w-10 h-10 stroke-primary" />
            <div className="font-semibold text-primary mt-2">
              {isDragging ? "Drop your PDF here" : "Upload Your Resume"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Drag & drop a PDF, or click to browse
            </div>
          </div>

          <input
            id="file-upload"
            type="file"
            accept={accept}
            className="hidden"
            ref={inputRef}
            onChange={handleInputChange}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeUploadSimple;
