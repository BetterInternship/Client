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
      className="hover:bg-slate-100 hover:cursor-pointer transition-all border-b"
      onClick={() => (documentId ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-3 sm:px-5 py-3 flex flex-col gap-2 text-xs sm:text-sm text-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="min-w-4 flex-shrink-0 mt-0.5">
              {rejectionReason ? (
                <XCircle className="w-4 h-4 text-destructive-foreground bg-destructive rounded-full" />
              ) : documentId ? (
                <CheckCircle2 className="w-4 h-4 text-supportive-foreground bg-supportive rounded-full" />
              ) : (
                <div className="animate-spin w-4 h-4 text-warning rounded-full border border-warning border-t-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-ellipsis line-clamp-1">{label}</div>
              <div className="text-gray-400 text-xs">{timestamp}</div>
            </div>
          </div>

          {/* Desktop action buttons and chevron */}
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            {!rejectionReason && !documentId && (
              <>
                <Button
                  className="text-xs h-7"
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    modalRegistry.resendFormRequest.open(formProcessId);
                  }}
                >
                  Resend
                </Button>
                <Button
                  className="text-xs h-7"
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    modalRegistry.cancelFormRequest.open(formProcessId);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            {documentId ? (
              <Button
                className="text-xs h-7 gap-1"
                size="xs"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <DownloadIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Download Form</span>
              </Button>
            ) : (
              <div className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded transition-colors cursor-pointer">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            )}
          </div>

          {/* Mobile chevron/download */}
          <div className="sm:hidden flex-shrink-0">
            {documentId ? (
              <Button
                className="text-xs h-7 gap-1"
                size="xs"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <DownloadIcon className="w-3 h-3" />
                <span>Download</span>
              </Button>
            ) : (
              <div className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded transition-colors cursor-pointer">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile action buttons */}
        {!rejectionReason && !documentId && (
          <div className="sm:hidden flex gap-1">
            <Button
              className="text-xs h-8 flex-1"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                modalRegistry.resendFormRequest.open(formProcessId);
              }}
            >
              Resend
            </Button>
            <Button
              className="text-xs h-8 flex-1"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                modalRegistry.cancelFormRequest.open(formProcessId);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Details section */}
        {!documentId && isOpen && (
          <div className="flex flex-col gap-1 mt-1">
            {!!rejectionReason && (
              <div className="flex flex-col gap-1">
                <Badge type="destructive" className="w-fit text-xs">
                  Rejected
                </Badge>
                <span className="text-gray-700 text-xs">{rejectionReason}</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5">
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
                    className="flex items-center gap-1 text-xs sm:ml-6"
                  >
                    {signingParty.signed ? (
                      <CheckIcon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    ) : (
                      <CircleDot className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    )}
                    {i > 0 &&
                    signingParties[i - 1].signed !== signingParty.signed ? (
                      !rejectionReason ? (
                        <AnimatedShinyText className="text-xs">
                          {displayName}
                        </AnimatedShinyText>
                      ) : (
                        <span className="text-destructive">{displayName}</span>
                      )
                    ) : (
                      <span
                        className={
                          signingParty.signed
                            ? "text-supportive"
                            : "text-gray-500"
                        }
                      >
                        {displayName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
