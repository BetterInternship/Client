import { RefObject, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ProcessingTransition } from "./ProcessingTransition";
import { UploadIcon } from "lucide-react";

const ResumeUpload = ({
  ref,
  promise,
  onSelect,
  onComplete,
}: {
  ref: RefObject<any>;
  promise?: Promise<any>;
  onSelect: (file: File) => void;
  onComplete: () => void;
}) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    onSelect(selectedFile);
    setIsProcessing(true);
  };

  return (
    <AnimatePresence>
      {isProcessing ? (
        <ProcessingTransition promise={promise} onComplete={onComplete} />
      ) : (
        <div className="flex flex-col items-center p-8 w-full mx-auto">
          <div
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#94A3B8] cursor-pointer hover:border-primary rounded-[0.33em] transition-colors"
            onClick={() => ref.current?.click()}
          >
            <UploadIcon className="w-10 h-10 stroke-primary" />
            <br />
            <div className="font-bold text-primary">Upload Your Resume</div>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            ref={ref}
            onChange={handleFileChange}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeUpload;
