import { Button } from "@/components/ui/button";
import useModalRegistry from "../modal-registry";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { Badge } from "@/components/ui/badge";

function AnimatedCheck() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 52 52"
      fill="none"
      className="text-supportive"
    >
      <path
        d="M14 27 L22 35 L38 18"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        className="check-path"
      />
    </svg>
  );
}

export function FormSubmissionSuccessModal({
  firstRecipient,
  submissionType,
  onClose,
}: {
  firstRecipient?: IFormSigningParty;
  submissionType: "esign" | "manual" | null;
  onClose: () => void;
}) {
  const modalRegistry = useModalRegistry();

  const handleNavigateToForms = () => {
    onClose();
    modalRegistry.formSubmissionSuccess.close();
  };

  const recipientEmail = firstRecipient?.signatory_account?.email?.trim();
  const isSentFlow = submissionType === "esign" && !!recipientEmail;

  return (
    <div className="flex w-full flex-col items-center gap-4 px-1 py-6 text-center sm:gap-6 sm:px-6 sm:py-10">
      <style>{`
        .check-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: drawCheck 300ms ease-out forwards;
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="w-full">
        {!isSentFlow ? (
          <>
            <h2 className="flex flex-row items-center text-left text-3xl font-semibold text-foreground">
              <span className="mr-2 mt-1">Form generated successfully</span>
              <AnimatedCheck />
            </h2>
            <p className="text-gray-500 text-left mt-4">
              You can now view and download it in your forms.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-2 items-start pt-2 sm:pt-4">
            <h2 className="flex flex-row items-center text-left text-3xl font-semibold text-foreground">
              <span className="mr-2 mt-1">Form sent successfully</span>
              <AnimatedCheck />
            </h2>
            <div className="mt-5 flex w-full flex-col items-start rounded-[0.33em] bg-gray-100 p-4 sm:mt-8 sm:p-5 sm:px-6">
              <div className="text-left">
                An initial email has been sent to the following address:
              </div>
              <Badge className="text-sm my-2" type="supportive">
                <pre>{recipientEmail}</pre>
              </Badge>
              <div className="text-left mt-5">
                Kindly ask them to check their Inbox or Spam folder.
              </div>
            </div>
            <div>
              <div className="mt-6 italic text-left text-gray-500 sm:mt-10">
                Note: If they did not receive the email, there may be an issue
                with the recipient's mailbox.
              </div>
              <div className="mt-4 mb-2 italic text-left text-gray-500">
                For help, contact us at{" "}
                <a
                  href="https://www.facebook.com/betterinternship.sherwin/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  facebook.com/betterinternship.sherwin
                </a>
                .
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="mt-1 w-full sm:mt-2"
        onClick={handleNavigateToForms}
      >
        Go to Forms
      </Button>
    </div>
  );
}
