"use client";

import { MyFormsContextProvider, useMyForms } from "./myforms.ctx";
import { useState } from "react";
import {
  CheckCircle2,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  Dot,
  DownloadIcon,
  Loader,
} from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MyFormsContextProvider>
      <div className="h-full overflow-auto">{children}</div>
      <FormLogSidePanel />
    </MyFormsContextProvider>
  );
};

const FormLogSidePanel = () => {
  const myForms = useMyForms();

  return (
    <div className="absolute sm:max-w-sm w-full right-0 h-full max-h-full overflow-auto bg-white border-l border-slate-300">
      <div className="relative font-semibold tracking-tight border-b">
        <div className="sticky top-0 text-primary font-bold text-xl p-5 bg-gray-50 z-50">
          My Form History
        </div>
        <div className="flex flex-col">
          {myForms.forms.map((form) => {
            return (
              <FormLog
                label={form.label}
                downloadUrl={
                  form.signed_document_id || form.prefilled_document_id
                }
              ></FormLog>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FormLog = ({
  label,
  downloadUrl,
}: {
  label: string;
  downloadUrl?: string | null;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handles the browser download behavior
  // We let the browser choose the filename by setting it empty
  const handleDownload = () => {
    return alert("TODO: Reimplement download behavior; pull url first.");
    if (!downloadUrl) return;
    try {
      setDownloading(true);
      const a = document.createElement("a");
      a.href = downloadUrl!;
      a.download = "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const pendingSigningParties = [
    { email: "modavid.1964@gmail.com", signed: true },
    { email: "modavid.1964+entity@gmail.com" },
    { email: "modavid.1964+guardian@gmail.com" },
  ];

  return (
    <div
      className=" hover:bg-slate-100 hover:cursor-pointer transition-all"
      onClick={() => (downloadUrl ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-5 flex flex-col border-b text-xs text-gray-700 font-normal">
        <div className="relative flex flex-row justify-between items-center h-full">
          <div className="flex flex-row gap-2 items-center py-3 min-w-5">
            <div className="min-w-4">
              {downloadUrl ? (
                <CheckCircle2 className="w-4 h-4 text-supportive-foreground bg-supportive rounded-full" />
              ) : (
                <Loader className="animate-spin w-4 h-4 text-warning rounded-full" />
              )}
            </div>
            <div className="text-ellipsis line-clamp-1 pr-5">{label}</div>
          </div>
          <div className="h-full p-3 hover:bg-white/50 transition-all">
            {downloadUrl ? (
              <DownloadIcon className="text-slate-400 w-4 h-4" />
            ) : isOpen ? (
              <ChevronUp className="text-slate-400 w-4 h-4" />
            ) : (
              <ChevronDown className="text-slate-400 w-4 h-4" />
            )}
          </div>
        </div>
        {!downloadUrl && isOpen && (
          <div className="flex flex-col gap-1 mb-4">
            {pendingSigningParties.map((psp, i) => (
              <div className="flex flex-row gap-2 text-[1em]">
                {psp.signed ? (
                  <CheckIcon className="w-2 h-2 m-1 text-slate-500" />
                ) : (
                  <Dot className="w-2 h-2 m-1 text-slate-500" />
                )}

                {i > 0 && pendingSigningParties[i - 1].signed !== psp.signed ? (
                  <AnimatedShinyText>{psp.email}</AnimatedShinyText>
                ) : (
                  <div
                    className={psp.signed ? "text-supportive" : "text-gray-500"}
                  >
                    {psp.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsLayout;
