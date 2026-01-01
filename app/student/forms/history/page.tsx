"use client";

import { useMyForms } from "../myforms.ctx";
import { useState } from "react";
import { formatTimeAgo } from "@/lib/utils";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import {
  ArrowLeft,
  CheckCircle2,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  CircleDot,
  DownloadIcon,
  Loader,
  Newspaper,
} from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

const FormLogPage = () => {
  const router = useRouter();
  const myForms = useMyForms();

  return (
    <div className="relative w-full flex flex-col h-full bg-gray-50">
      <div className="w-full bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex sm:items-center items-start justify-between flex-col sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
      <div className="container max-w-5xl p-10 pt-16 mx-auto">
        <div className="animate-fade-in">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper}></HeaderIcon>
            <HeaderText>Form History</HeaderText>
          </div>
          <Badge>{myForms.forms.length} generated forms</Badge>
          <Divider />
        </div>

        <div className="mb-6 sm:mb-8 animate-fade-in">
          {myForms.forms
            .toSorted(
              (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
            )
            .map((form) => (
              <FormLog
                label={form.label}
                documentId={
                  form.signed_document_id ?? form.prefilled_document_id
                }
                timestamp={formatTimeAgo(form.timestamp)}
                downloadUrl={form.latest_document_url}
                signingParties={form.signing_parties}
              ></FormLog>
            ))}
          {!myForms.forms.length && (
            <div className="text-gray-500">
              You haven't generated any forms yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormLog = ({
  label,
  timestamp,
  documentId,
  downloadUrl,
  signingParties,
}: {
  label: string;
  timestamp: string;
  documentId?: string | null;
  downloadUrl?: string | null;
  signingParties?: IFormSigningParty[];
}) => {
  const [downloading, setDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handles the browser download behavior
  // We let the browser choose the filename by setting it empty
  const handleDownload = () => {
    if (!documentId) return;
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

  return (
    <div
      className=" hover:bg-slate-100 hover:cursor-pointer transition-all"
      onClick={() => (documentId ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-5 flex flex-col border-b text-xs text-gray-700 font-normal">
        <div className="relative flex flex-row justify-between h-full items-start">
          <div className="flex flex-row gap-2 py-3 min-w-5 items-start">
            <div className="min-w-4">
              {documentId ? (
                <CheckCircle2 className="w-4 h-4 text-supportive-foreground bg-supportive rounded-full" />
              ) : (
                <Loader className="animate-spin w-4 h-4 text-warning rounded-full" />
              )}
            </div>
            <div>
              <div className="text-ellipsis line-clamp-1 pr-5">{label}</div>
              <div className="pr-5 text-gray-400 mt-1">{timestamp}</div>
            </div>
          </div>
          <div className="h-full p-2 m-1 hover:bg-white/50 transition-all rounded-full aspect-square">
            {documentId ? (
              <DownloadIcon className="text-slate-400 w-4 h-4 mb-1" />
            ) : isOpen ? (
              <ChevronUp className="text-slate-400 w-4 h-4 mb-1" />
            ) : (
              <ChevronDown className="text-slate-400 w-4 h-4 mb-1" />
            )}
          </div>
        </div>
        {!documentId && isOpen && (
          <div className="flex flex-col gap-1 mb-4">
            {signingParties?.map((signingParty, i) => {
              const displayName =
                signingParty._id === "initiator"
                  ? "You"
                  : (signingParty.signatory_account?.email ??
                    signingParty.signatory_account?.name ??
                    `(${signingParty.signatory_source?.label})`);
              return (
                <div className="flex flex-row gap-2 text-[1em]">
                  {signingParty.signed ? (
                    <CheckIcon className="w-2 h-2 m-1 text-slate-500" />
                  ) : (
                    <CircleDot className="w-2 h-2 m-1 text-slate-500" />
                  )}

                  {i > 0 &&
                  signingParties[i - 1].signed !== signingParty.signed ? (
                    <AnimatedShinyText>{displayName}</AnimatedShinyText>
                  ) : (
                    <div
                      className={
                        signingParty.signed
                          ? "text-supportive"
                          : "text-gray-500"
                      }
                    >
                      {displayName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLogPage;
