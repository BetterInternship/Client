import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { Clipboard, CheckCircle, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import React, {
  RefObject,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
} from "react";
import { useProfileData } from "@/lib/api/student.data.api";
import { Textarea } from "../ui/textarea";
import { SuperChallengeDetails } from "../shared/jobs";

export const ApplyConfirmModal = React.memo(function ApplyConfirmModal({
  job,
  ref,
  onClose,
  onAddNow,
  onSubmit,
}: {
  job: Job | null;
  ref?: RefObject<ModalHandle | null>;
  onClose: () => void;
  onAddNow: () => void;
  onSubmit: (payload: {
    coverLetter: string;
    challengeSubmission: string;
  }) => Promise<void>;
}) {
  const profile = useProfileData();
  const coverRef = useRef<ApplicationTextInputHandle | null>(null);
  const challengeRef = useRef<ApplicationTextInputHandle | null>(null);
  const [applying, setApplying] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const isSuperListing = Boolean(job?.challenge);

  const needsGH = !!job?.internship_preferences?.require_github;
  const needsPF = !!job?.internship_preferences?.require_portfolio;
  const needsCL =
    (job?.internship_preferences?.require_cover_letter ?? true) === true;

  const hasGH = !!profile.data?.github_link?.trim();
  const hasPF = !!profile.data?.portfolio_link?.trim();

  const unmetPreSubmit = useMemo(() => {
    const u: string[] = [];
    if (needsGH && !hasGH) u.push("GitHub profile link");
    if (needsPF && !hasPF) u.push("Portfolio link");

    return u;
  }, [needsGH, hasGH, needsPF, hasPF]);

  const preSubmitDisabled = unmetPreSubmit.length > 0;

  async function handleSubmit() {
    setCoverError(null);
    setChallengeError(null);
    const coverText = coverRef.current?.getValue().trim() ?? "";
    const challengeText = challengeRef.current?.getValue().trim() ?? "";

    if (isSuperListing && challengeText.length === 0) {
      setChallengeError(
        "Please submit your challenge response before applying.",
      );
      challengeRef.current?.focus();
      return;
    }

    if (needsCL && coverText.length === 0) {
      setCoverError("Please add a brief cover letter before submitting.");
      coverRef.current?.focus();
      return;
    }

    try {
      setApplying(true);
      await onSubmit({
        coverLetter: coverText,
        challengeSubmission: challengeText,
      });
    } finally {
      setApplying(false);
    }
  }

  return (
    <ModalComponent ref={ref} className={isSuperListing ? "max-w-4xl w-[56rem]" : undefined}>
      <div className={`${isSuperListing ? "" : "max-w-lg mx-auto"} p-6 pt-0 overflow-auto space-y-4`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSuperListing ? "bg-amber-100" : "bg-blue-100"}`}>
            {isSuperListing ? (
              <span className="text-3xl">⚡</span>
            ) : (
              <Clipboard className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isSuperListing ? "Apply to Super Listing" : "Ready to Apply?"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You're applying for{" "}
            <span className="font-semibold text-gray-900">{job?.title}</span>
            {job?.employer?.name && (
              <>
                {" "}
                at{" "}
                <span className="font-semibold text-gray-900">
                  {job.employer.name}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Super Challenge Section */}
        {isSuperListing && job && (
          <div className="space-y-4">
            <SuperChallengeDetails job={job} />

            {/* Challenge Submission Input */}
            <ApplicationTextInput
              ref={challengeRef}
              defaultValue=""
              error={challengeError}
              label="Your Submission"
              helper="Describe your proposed solution clearly."
              maxLength={4000}
              placeholder="Write your challenge submission here..."
            />
          </div>
        )}

        {/* Cover Letter Input */}
        {needsCL && (
          <div className="space-y-3">
            <div
              className="rounded-[0.33em] border border-amber-200 bg-amber-50 
                 text-amber-800 px-3 py-2 text-sm"
            >
              <span className="font-medium">Note:</span> A cover letter is
              required for this application.
            </div>
            <ApplicationTextInput
              ref={coverRef}
              defaultValue=""
              error={coverError}
              label="Cover Letter"
              maxLength={500}
              placeholder={`Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]`}
            />
          </div>
        )}

        {/* Requirements */}
        <RequirementsChecklist
          needsGH={needsGH}
          needsPF={needsPF}
          hasGH={hasGH}
          hasPF={hasPF}
          onAddNow={onAddNow}
        />

        {/* Inline error */}
        {(challengeError || coverError) && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-3 rounded-[0.33em] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
          >
            <div className="font-medium mb-1">Incomplete requirements</div>
            {challengeError ?? coverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={applying}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`flex-1 h-12 ${isSuperListing ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-amber-400/50 shadow-[0_4px_14px_rgba(245,158,11,0.3)] font-bold" : ""}`}
            disabled={preSubmitDisabled || applying}
            title={
              preSubmitDisabled
                ? "Complete GitHub/Portfolio to continue"
                : undefined
            }
          >
            {!applying ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Submit Application
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Submitting Application
              </div>
            )}
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
});

export type ApplicationTextInputHandle = {
  getValue: () => string;
  focus: () => void;
};

const ApplicationTextInput = React.memo(
  React.forwardRef(function ApplicationTextInput(
    {
      defaultValue,
      error,
      label,
      helper,
      maxLength = 500,
      placeholder,
    }: {
      defaultValue?: string;
      error?: string | null;
      label?: string;
      helper?: string;
      maxLength?: number;
      placeholder?: string;
    },
    ref: React.Ref<ApplicationTextInputHandle>,
  ) {
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const [count, setCount] = useState(defaultValue?.length ?? 0);

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => taRef.current?.value ?? "",
        focus: () => taRef.current?.focus(),
      }),
      [],
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <Textarea
          ref={taRef}
          defaultValue={defaultValue}
          onInput={(e) =>
            setCount((e.target as HTMLTextAreaElement).value.length)
          }
          placeholder={placeholder}
          className={
            "w-full h-24 p-3 border rounded-[0.33em] resize-none text-sm overflow-y-auto " +
            (error
              ? "border-red-500 focus:border-red-600 focus:ring-red-200 "
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 ")
          }
          maxLength={maxLength}
        />
        <div className="flex justify-between text-xs">
          <span className={error ? "text-red-600" : "text-gray-500"}>
            {error ?? helper ?? "\u00A0"}
          </span>
          <span className="text-gray-500">
            {count}/{maxLength}
          </span>
        </div>
      </div>
    );
  }),
);

const RequirementsChecklist = React.memo(function RequirementsChecklist({
  needsGH,
  needsPF,
  hasGH,
  hasPF,
  onAddNow,
}: {
  needsGH: boolean;
  needsPF: boolean;
  hasGH: boolean;
  hasPF: boolean;
  onAddNow: () => void;
}) {
  if (!(needsGH || needsPF)) return null;

  const Row = ({
    label,
    isReady,
    onClick,
  }: {
    label: string;
    isReady: boolean;
    onClick: () => void;
  }) => (
    <li className="rounded-[0.33em] px-3 py-2 flex items-center justify-between">
      <span className="font-medium">{label}</span>

      {isReady ? (
        <span className="text-green-600 flex items-center gap-1 text-sm">
          <CheckCircle className="w-4 h-4" /> Ready
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm">Missing</span>
          <Button size="sm" variant="outline" onClick={onClick}>
            Add now
          </Button>
        </div>
      )}
    </li>
  );

  return (
    <>
      <div className="text-sm font-medium mb-1">Requirements</div>
      <div className="rounded-[0.33em] border p-1 bg-gray-50">
        <ul className=" text-sm">
          {needsGH && (
            <Row
              label="GitHub profile link"
              isReady={hasGH}
              onClick={onAddNow}
            />
          )}
          {needsPF && (
            <Row label="Portfolio link" isReady={hasPF} onClick={onAddNow} />
          )}
        </ul>
      </div>
    </>
  );
});
