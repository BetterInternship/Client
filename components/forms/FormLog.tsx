"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DownloadIcon,
  XCircle,
  Loader2,
} from "lucide-react";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { Badge } from "../ui/badge";
import { Divider } from "../ui/divider";
import { Button } from "../ui/button";
import { SigningStatusTimeline } from "./SigningStatusTimeline";
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
  status,
  rejectionReason,
  index = -1,
}: {
  formProcessId: string;
  label: string;
  timestamp: string;
  documentId?: string | null;
  downloadUrl?: string | null;
  signingParties?: IFormSigningParty[];
  status?: string | null;
  rejectionReason?: string;
  index?: number;
}) => {
  const modalRegistry = useModalRegistry();
  const [downloading, setDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(index === 0);

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
      className="hover:bg-slate-100 hover:cursor-pointer transition-all border-b "
      onClick={() => (documentId ? handleDownload() : setIsOpen(!isOpen))}
    >
      <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status === "rejected" ? (
            <Badge
              type="destructive"
              className=" gap-1 flex items-center font-medium"
            >
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </Badge>
          ) : status === "cancelled" ? (
            <Badge
              type="destructive"
              className=" gap-1 flex items-center font-medium"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelled
            </Badge>
          ) : status === "done" ? (
            <Badge
              type="supportive"
              className="gap-1 flex items-center font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </Badge>
          ) : (
            <Badge
              type="warning"
              className="gap-1 flex items-center font-medium"
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
              <div className="flex flex-col gap-4">
                {!!rejectionReason && (
                  <div className="flex flex-col bg-red-50 p-4 rounded-[0.33em]">
                    <div className="text-xs font-semibold text-red-700">
                      {status === "cancelled"
                        ? "Reason for cancellation"
                        : "Reason for rejection"}
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
                    <SigningStatusTimeline
                      signingParties={signingParties}
                      downloadUrl={downloadUrl}
                    />
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
