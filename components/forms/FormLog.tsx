"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  CircleDot,
  DownloadIcon,
  XCircle,
} from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { Badge } from "../ui/badge";
import { Divider } from "../ui/divider";
import { Button } from "../ui/button";
import useModalRegistry from "../modals/modal-registry";

/**
 * Form Log Item
 */
export const FormLog = ({
  formProcessId,
  label,
  timestamp,
  documentId,
  downloadUrl,
  signingParties,
  rejectionReason,
}: {
  formProcessId: string;
  label: string;
  timestamp: string;
  documentId?: string | null;
  downloadUrl?: string | null;
  signingParties?: IFormSigningParty[];
  rejectionReason?: string;
}) => {
  const modalRegistry = useModalRegistry();
  const [downloading, setDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  if (rejectionReason) console.log(rejectionReason);

  return (
    <div
      className="hover:bg-slate-100 hover:cursor-pointer transition-all"
      onClick={() => (documentId ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-5 flex flex-col border-b text-sm text-gray-700 font-normal">
        <div className="relative flex flex-row justify-between h-full items-start">
          <div className="flex flex-row gap-2 py-3 min-w-5 items-start">
            <div className="min-w-4">
              {rejectionReason ? (
                <XCircle className="w-4 h-4 text-destructive-foreground bg-destructive rounded-full" />
              ) : documentId ? (
                <CheckCircle2 className="w-4 h-4 text-supportive-foreground bg-supportive rounded-full" />
              ) : (
                <div className="animate-spin w-4 h-4 text-warning rounded-full border border-warning border-t-transparent" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <div className="text-ellipsis line-clamp-1 pr-5">{label}</div>
                <div className="text-gray-400">{timestamp}</div>
              </div>
              {!rejectionReason && !documentId && (
                <div className="flex flex-row gap-1">
                  <Button
                    className=""
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      modalRegistry.resendFormRequest.open(formProcessId);
                    }}
                  >
                    Resend Form Email
                  </Button>
                  <Button
                    className=""
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      modalRegistry.cancelFormRequest.open(formProcessId);
                    }}
                  >
                    Cancel Form Request
                  </Button>
                </div>
              )}
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
            <div className="">
              {!!rejectionReason && (
                <div className="flex flex-col gap-2">
                  <Badge type="destructive" className="w-fit">
                    Your form was rejected by one of the signatories.
                  </Badge>
                  <span className="text-gray=700">{rejectionReason}</span>
                </div>
              )}
              <Divider></Divider>
            </div>
            {signingParties?.map((signingParty, i) => {
              const displayName =
                signingParty._id === "initiator"
                  ? "You"
                  : (signingParty.signatory_account?.email ??
                    signingParty.signatory_account?.name ??
                    `(${signingParty.signatory_source?.label})`);
              return (
                <div
                  key={signingParty._id}
                  className="flex flex-row gap-2 text-[1em]"
                >
                  {signingParty.signed ? (
                    <CheckIcon className="w-2 h-2 m-1 text-slate-500" />
                  ) : (
                    <CircleDot className="w-2 h-2 m-1 text-slate-500" />
                  )}

                  {i > 0 &&
                  signingParties[i - 1].signed !== signingParty.signed ? (
                    !rejectionReason ? (
                      <AnimatedShinyText>{displayName}</AnimatedShinyText>
                    ) : (
                      <span className="text-destructive">{displayName}</span>
                    )
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
