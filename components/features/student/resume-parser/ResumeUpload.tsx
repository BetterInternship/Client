import { RefObject, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ProcessingTransition } from "./ProcessingTransition";
import { UploadIcon } from "lucide-react";

const ResumeUpload = ({
  ref,
  promise,
  onSelect,
  onComplete,
  isParsing,
  accept = ".pdf,application/pdf",
  maxSizeMB = 5,
}: {
  ref: RefObject<HTMLInputElement>;
  promise?: Promise<any>;
  onSelect: (file: File) => void;
  onComplete: () => void;
  isParsing: boolean;
  accept?: string;
  maxSizeMB?: number;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const triggerFileDialog = () => ref.current?.click();
  const handleChosenFile = (f?: File | null) => {
    if (!f) return;

    // simple checks
    const tooBig = f.size > maxSizeMB * 1024 * 1024;
    if (tooBig) {
      alert(`File must be ≤ ${maxSizeMB}MB.`);
      return;
    }
    // accept check (relies on extension or mime)
    const allowed = accept.split(",").map((s) => s.trim().toLowerCase());
    const nameOk = allowed.some(
      (a) => a.startsWith(".") && f.name.toLowerCase().endsWith(a)
    );
    const mimeOk = allowed.some(
      (a) => !a.startsWith(".") && f.type.toLowerCase() === a
    );
    if (!(nameOk || mimeOk)) {
      alert("Please upload a PDF file.");
      return;
    }

    setFile(f);
    onSelect(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChosenFile(e.target.files?.[0] ?? null);
    if (ref.current) ref.current.value = "";
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
      {isParsing ? (
        <ProcessingTransition promise={promise} onComplete={onComplete} />
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
            ref={ref}
            onChange={handleInputChange}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeUpload;
