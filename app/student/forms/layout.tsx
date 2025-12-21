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
  LogsIcon,
  LucideChevronsLeft,
  LucideChevronsRight,
} from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { cn } from "@/lib/utils";
import { HeaderIcon } from "@/components/ui/text";
import { useMobile } from "@/hooks/use-mobile";

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MyFormsContextProvider>
      <FormRendererContextProvider>
        <div className="h-full overflow-auto">{children}</div>
        <FormLogSidePanel />
      </FormRendererContextProvider>
    </MyFormsContextProvider>
  );
};

const FormLogSidePanel = () => {
  const myForms = useMyForms();
  const disabled = myForms.forms.length === 0;
  const { isMobile } = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) return <></>;
  return (
    <>
      {isOpen && (
        <div
          className={cn(
            "absolute w-full h-full transition-opacity duration-500",
            isOpen ? "bg-black bg-opacity-15" : "bg-transparent bg-opacity-0",
          )}
        />
      )}
      <div
        className={cn(
          "absolute sm:max-w-sm left-0 h-full max-h-full overflow-auto bg-white border-l border-slate-300 transition-all duration-500",
          isOpen ? "left-0" : "left-[-96em]",
        )}
      >
        <div className="relative font-semibold tracking-tight border-b">
          <div className="sticky flex items-center gap-2 top-0 text-primary font-bold text-xl p-5 bg-white z-50 border-b-2 border-t border-gray-100">
            <HeaderIcon className="w-4 h-4 p-1" icon={LogsIcon} />
            My Form History
            {isOpen && isMobile && (
              <div
                className="absolute right-0 p-3 m-2 bg-white rounded-full border border-gray-300 hover:bg-slate-100 transition-all hover:cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <LucideChevronsLeft className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {myForms.forms.map((form) => {
              return (
                <FormLog
                  label={form.label}
                  downloadUrl={
                    form.signed_document_id || form.prefilled_document_id
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
      {!isOpen && (
        <div
          className="absolute p-3 m-2 mt-3 bg-white rounded-full border border-gray-300 hover:bg-slate-100 transition-all hover:cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <LucideChevronsRight className="w-4 h-4" />
        </div>
      )}
      {isOpen && !isMobile && (
        <div
          className="absolute left-96 p-3 m-2 mt-3  bg-white rounded-full border border-gray-300 hover:bg-slate-100 transition-all hover:cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <LucideChevronsLeft className="w-4 h-4" />
        </div>
      )}
    </>
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
