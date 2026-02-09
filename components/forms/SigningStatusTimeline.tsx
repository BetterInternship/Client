import { useMemo } from "react";
import { DownloadIcon } from "lucide-react";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { Timeline, TimelineItem } from "../ui/timeline";
import { AnimatedShinyText } from "../ui/animated-shiny-text";
import { Button } from "../ui/button";

interface SigningStatusTimelineProps {
  signingParties?: IFormSigningParty[];
  downloadUrl?: string | null;
}

export const SigningStatusTimeline = ({
  signingParties,
  downloadUrl,
}: SigningStatusTimelineProps) => {
  if (!signingParties || signingParties.length === 0) {
    return null;
  }

  const { latestPendingIndex, latestSignedIndex } = useMemo(() => {
    let latestPending = -1;
    let latestSigned = -1;

    for (let i = 0; i < signingParties.length; i++) {
      if (!signingParties[i].signed && latestPending === -1) {
        latestPending = i;
      }
      if (signingParties[i].signed) {
        latestSigned = i;
      }
    }

    return {
      latestPendingIndex: latestPending,
      latestSignedIndex: latestSigned,
    };
  }, [signingParties]);

  return (
    <Timeline>
      {signingParties.map((signingParty, i) => {
        const displayName =
          signingParty._id === "initiator"
            ? "You"
            : (signingParty.signatory_account?.email ??
              signingParty.signatory_account?.name ??
              `(${signingParty.signatory_source?.label})`);

        const isSigned = signingParty.signed;
        const isLatestPending = i === latestPendingIndex;
        const isLatestSigned = i === latestSignedIndex;

        return (
          <TimelineItem
            key={signingParty._id}
            number={isSigned ? -1 : i + 1}
            title={
              isLatestPending && !isSigned ? (
                <div className="text-xs">
                  <AnimatedShinyText>
                    {signingParty.signatory_title}
                  </AnimatedShinyText>
                </div>
              ) : (
                <div
                  className={`text-xs ${isSigned ? "text-emerald-600" : "text-gray-900"}`}
                >
                  {signingParty.signatory_title}
                </div>
              )
            }
            subtitle={
              <div className="text-xs text-gray-500">
                {isLatestPending && !isSigned ? (
                  <AnimatedShinyText>{displayName}</AnimatedShinyText>
                ) : (
                  displayName
                )}
              </div>
            }
            isLast={i === signingParties.length - 1}
          >
            {isLatestSigned && downloadUrl && (
              <Button
                size="sm"
                onClick={() => {
                  window.open(downloadUrl, "_blank", "noopener,noreferrer");
                }}
                title="Download signed form"
                className="text-xs h-8"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Download Latest Form
              </Button>
            )}
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};
