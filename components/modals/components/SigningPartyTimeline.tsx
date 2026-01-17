import { IFormSigningParty } from "@betterinternship/core/forms";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

interface SigningPartyTimelineProps {
  signingParties?: IFormSigningParty[];
}

export const SigningPartyTimeline = ({
  signingParties,
}: SigningPartyTimelineProps) => {
  if (!signingParties || signingParties.length === 0) {
    return null;
  }

  return (
    <Timeline>
      {signingParties.map((party, index) => {
        // Find the source party's title if signatory_source exists
        let sourceTitle = "";
        if (party.signatory_source?._id) {
          const sourceParty = signingParties.find(
            (p) => p._id === party.signatory_source?._id,
          );
          sourceTitle = sourceParty?.signatory_title.trim() || "";
        }

        const isSourceFromYou = sourceTitle === "Student";
        const isYou = party.signatory_title == "Student";

        let displayTitle = party.signatory_title;
        if (isYou) {
          displayTitle = "You";
        }

        return (
          <TimelineItem
            key={party._id}
            number={party.order}
            title={
              isYou ? (
                <span className="text-sm bg-blue-100 text-primary px-2 py-1 rounded font-medium">
                  You
                </span>
              ) : (
                displayTitle
              )
            }
            subtitle={
              sourceTitle && (
                <div className="flex items-center gap-2">
                  <span>
                    email coming from{" "}
                    {isSourceFromYou ? (
                      <span className="text-xs bg-blue-100 text-primary px-1.5 py-0.5 rounded font-medium">
                        You
                      </span>
                    ) : (
                      sourceTitle
                    )}
                  </span>
                </div>
              )
            }
            isLast={index === signingParties.length - 1}
          />
        );
      })}
    </Timeline>
  );
};
