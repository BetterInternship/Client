import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { Clipboard, CheckCircle, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { RefObject, useState } from "react";
import { useProfileData } from "@/lib/api/student.data.api";
import { Textarea } from "../ui/textarea";

export const ApplyConfirmModal = ({
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
  onSubmit: (text: string) => Promise<void>;
}) => {
  const profile = useProfileData();
  const [text, setText] = useState("");
  const [applying, setApplying] = useState(false);

  const needsGH = !!job?.require_github;
  const needsPF = !!job?.require_portfolio;
  const needsCL = (job?.require_cover_letter ?? true) === true;

  const hasGH = !!profile.data?.github_link?.trim();
  const hasPF = !!profile.data?.portfolio_link?.trim();
  const hasCL = !!text.trim();

  const unmet: string[] = [];
  if (needsGH && !hasGH) unmet.push("GitHub profile link");
  if (needsPF && !hasPF) unmet.push("Portfolio link");
  if (needsCL && !hasCL) unmet.push("Cover letter");

  const submitDisabled = unmet.length > 0;

  return (
    <ModalComponent ref={ref}>
      <div className="max-w-lg mx-auto p-6 pt-0 overflow-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Clipboard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Apply?
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

        {/* Cover Letter */}
        {needsCL && (
          <div className="mb-6 space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]`}
              className="w-full h-20 p-3 border border-gray-300 rounded-[0.33em] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm overflow-y-auto"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                💡 <span>Mention specific skills and enthusiasm</span>
              </span>
              <span className="text-gray-500">{text.length}/500</span>
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        {(needsCL || needsGH || needsPF) && (
          <>
            <div className="text-sm font-medium mb-2">Requirements</div>
            <div className="mb-6 rounded-[0.33em] border p-4 bg-gray-50">
              <ul className="space-y-2 text-sm">
                {needsGH && (
                  <li className="flex items-center justify-between">
                    <span>GitHub profile link</span>
                    {hasGH ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={onAddNow}>
                        Add now
                      </Button>
                    )}
                  </li>
                )}

                {needsPF && (
                  <li className="flex items-center justify-between">
                    <span>Portfolio link</span>
                    {hasPF ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={onAddNow}>
                        Add now
                      </Button>
                    )}
                  </li>
                )}

                {needsCL && (
                  <li className="flex items-center justify-between">
                    <span>Cover letter</span>
                    {hasCL ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-600">Required</span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* Inline error banner (why it didn't submit) */}
        {submitDisabled && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-3 rounded-[0.33em] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
          >
            <div className="font-medium mb-1">Incomplete requirements</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={applying}
            className="flex-1 h-12 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setApplying(true);
              onSubmit(text)
                .then(console.log)
                .then(() => setApplying(false))
                .catch(console.warn);
            }}
            className="flex-1 h-12 transition-all duration-200"
            disabled={submitDisabled || applying}
            title={
              submitDisabled ? "Complete required items to continue" : undefined
            }
          >
            {!applying ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Submit Application
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5" />
                Submitting Application
              </div>
            )}
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
};
