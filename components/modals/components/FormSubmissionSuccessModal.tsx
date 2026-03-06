import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToForms = () => {
    onClose();
    modalRegistry.closeAll();
  };

  const process = submissionType == "esign" ? "sent" : "generated";
  console.log("FormSubmissionSuccessModal rendered with type:", submissionType);

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10 text-center mt-2">
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

      <div className="">
        {submissionType === "manual" ? (
          <>
            <h2 className="flex flex-row items-center text-left text-3xl font-semibold text-foreground">
              <span className="mr-2 mt-1">Form {process} successfully</span>
              <AnimatedCheck />
            </h2>
            <p className="text-gray-500 text-left mt-4">
              You can now view and download it in your forms.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-2 items-start pt-4">
            <h2 className="flex flex-row items-center text-left text-3xl font-semibold text-foreground">
              <span className="mr-2 mt-1">Form {process} successfully</span>
              <AnimatedCheck />
            </h2>
            <div className="flex flex-col bg-gray-100 w-full p-5 px-6 items-start rounded-[0.33em] mt-8">
              <div className="text-left">
                An initial email has been sent to the following address:
              </div>
              <Badge className="text-sm my-2" type="supportive">
                <pre>{firstRecipient?.signatory_account?.email}</pre>
              </Badge>
              <div className="text-left mt-5">
                Kindly ask them to check their Inbox or Spam folder.
              </div>
            </div>
            <div>
              <div className="mt-10 italic text-left text-gray-500">
                Note: If they did not receive the email, there may be an issue
                with the recipient's mailbox.
              </div>
              <div className="mt-4 mb-2 italic text-left text-gray-500">
                For help, contact us at{" "}
                <a href="https://facebook.com/shi.sherwin">
                  facebook.com/shi.sherwin
                </a>
                .
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="mt-2 w-full "
        onClick={handleNavigateToForms}
      >
        Go to Forms
      </Button>
    </div>
  );
}
