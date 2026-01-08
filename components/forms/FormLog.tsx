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
  Loader2,
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
      className="hover:bg-slate-50 hover:shadow-sm hover:cursor-pointer transition-all border-b "
      onClick={() => (documentId ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {rejectionReason ? (
            <Badge
              type="destructive"
              className="px-2.5 py-1 gap-1.5 flex items-center font-medium"
            >
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </Badge>
          ) : documentId ? (
            <Badge
              type="supportive"
              className="px-2.5 py-1 gap-1.5 flex items-center font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </Badge>
          ) : (
            <Badge
              type="warning"
              className="px-2.5 py-1 gap-1.5 flex items-center font-medium"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Pending
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-3">
          {/* Header with Label, Timestamp, and Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 text-ellipsis line-clamp-1">
                {label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{timestamp}</div>
            </div>

            {/* Desktop action buttons and chevron */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              {!rejectionReason && !documentId && (
                <>
                  <Button
                    className="text-xs h-8"
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
                    className="text-xs h-8"
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
                  className="text-xs h-8 gap-1"
                  size="xs"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              ) : (
                <button
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                  }}
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Mobile chevron/download */}
            <div className="sm:hidden flex-shrink-0">
              {documentId ? (
                <Button
                  className="text-xs h-8 gap-1"
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
                <button
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                  }}
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile action buttons */}
          {!rejectionReason && !documentId && (
            <div className="sm:hidden flex gap-2">
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

          {/* Expandable Details Section */}
          {!documentId && isOpen && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-[0.33em]">
              <div className="flex flex-col gap-2">
                {!!rejectionReason && (
                  <div className="flex flex-col gap-2 bg-red-50 p-3 rounded-md">
                    <div className="text-xs font-semibold text-red-700">
                      Reason for Rejection
                    </div>
                    <span className="text-gray-700 text-xs leading-relaxed">
                      {rejectionReason}
                    </span>
                  </div>
                )}
                {signingParties && signingParties.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-semibold text-gray-700">
                      Signing Status
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {signingParties.map((signingParty, i) => {
                        const displayName =
                          signingParty._id === "initiator"
                            ? "You"
                            : (signingParty.signatory_account?.email ??
                              signingParty.signatory_account?.name ??
                              `(${signingParty.signatory_source?.label})`);

                        // Find the latest signed signatory
                        const latestSignedIndex = signingParties
                          .map((p, idx) => ({ ...p, idx }))
                          .filter((p) => p.signed)
                          .sort((a, b) => b.idx - a.idx)[0]?.idx;

                        const isLatestSigned = i === latestSignedIndex;

                        const handleDownloadLatest = () => {
                          if (!downloadUrl) return;
                          try {
                            setDownloading(true);
                            const a = document.createElement("a");
                            a.href = downloadUrl;
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
                            key={signingParty._id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {signingParty.signed ? (
                                <Badge
                                  type="supportive"
                                  className="px-2 py-2 gap-1 flex items-center text-xs whitespace-nowrap flex-shrink-0"
                                >
                                  <CheckIcon className="w-3 h-3" />
                                  Signed
                                </Badge>
                              ) : (
                                <Badge
                                  type="default"
                                  className="px-2 py-2 gap-1 flex items-center text-xs text-gray-600 whitespace-nowrap flex-shrink-0"
                                >
                                  <CircleDot className="w-3 h-3" />
                                  Pending
                                </Badge>
                              )}
                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900">
                                  {signingParty.signatory_title}
                                </div>
                                <span className="text-xs text-gray-600 truncate">
                                  {displayName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto">
                              {isLatestSigned && downloadUrl ? (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadLatest();
                                  }}
                                  className="text-xs"
                                >
                                  <DownloadIcon className="w-3 h-3" />
                                  Download Latest Form
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
