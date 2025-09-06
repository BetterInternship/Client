import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { getMissingProfileFields } from "../../lib/utils/user-utils";
import { AlertTriangle, User } from "lucide-react";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { RefObject } from "react";

export const IncompleteProfileModal = ({
  profile,
  job,
  ref,
}: {
  profile: any;
  job: Job | null;
  ref?: RefObject<ModalHandle | null>;
}) => {
  const router = useRouter();

  return (
    <ModalComponent ref={ref}>
      <div className="p-6">
        {(() => {
          let { missing, labels } = getMissingProfileFields(profile.data);

          // Add job-specific requirements if needed
          if (job?.require_github && !profile.data?.github_link?.trim()) {
            if (!missing.includes("github_link")) missing.push("github_link");
            labels.github_link = "GitHub Profile";
          }
          if (job?.require_portfolio && !profile.data?.portfolio_link?.trim()) {
            if (!missing.includes("portfolio_link"))
              missing.push("portfolio_link");
            labels.portfolio_link = "Portfolio Link";
          }

          const missingCount = missing.length;

          return (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You need to complete your profile before applying to jobs.
                  {missingCount === 1
                    ? "There is 1 required field missing."
                    : `There are ${missingCount} required fields missing.`}
                </p>
              </div>

              {/* Missing Fields List */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Missing Information
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {missing.map((field) => (
                    <div
                      key={field}
                      className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      <span className="text-sm font-medium text-orange-800">
                        {labels[field]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => ref?.current?.close()}
                  className="flex-1 h-12 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    ref?.current?.close();
                    router.push("/profile?edit=true");
                  }}
                  size="md"
                  scheme="supportive"
                  className="h-12"
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    Complete Profile
                  </div>
                </Button>
              </div>
            </>
          );
        })()}
      </div>
    </ModalComponent>
  );
};
