import { EmployerApplication, InternshipPreferences } from "@/lib/db/db.types";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { getFullName } from "@/lib/profile";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFile } from "@/hooks/use-file";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplicantPageProps {
    application: EmployerApplication | undefined;
    onStatusChange?: (status: number) => void;
    onStatusButtonClick?: (id: string, status: number) => void;
    openChatModal?: () => void;
}

export function ApplicantPage({
    application,
    onStatusChange,
    onStatusButtonClick,
    openChatModal,
}:ApplicantPageProps) {
    const router = useRouter();
    const {
        open: openResumeModal,
        close: closeResumeModal,
        Modal: ResumeModal,
      } = useModal("resume-modal");

      const { url: resumeURL, sync: syncResumeURL } = useFile({
          fetcher: useCallback(
            async () =>
              await UserService.getUserResumeURL(application?.user_id ?? ""),
            [application?.user_id],
          ),
          route: application
            ? `/users/${application.user_id}/resume`
            : "",
        });
      

    return(
        <>
            <div className="max-w-7xl w-full">
                <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
                onClick={() => router.push(`/dashboard/manage?jobId=${application?.job_id}`)}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <ApplicantModalContent
                    is_employer={true}
                    clickable={true}
                    pfp_fetcher={async () =>
                        UserService.getUserPfpURL(application?.user?.id ?? "")
                    }
                    pfp_route={`/users/${application?.user_id}/pic`}
                    applicant={{
                        ...application?.user,
                        internship_preferences: application?.user?.internship_preferences as InternshipPreferences ?? undefined
                        }}
                    open_resume={async () => {
                        await syncResumeURL();
                        openResumeModal();
                    }}
                    job={application?.job}
                    resume_url={resumeURL}
                />
            </div>
            <ResumeModal>
            {application?.user?.resume ? (
            <div className="h-full flex flex-col">
                <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-900">
                {getFullName(application?.user)} - Resume
                </h1>
                <PDFPreview url={resumeURL} />
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center h-96 px-8">
                <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
                    No Resume Available
                </h1>
                <div className="max-w-md text-center border border-red-200 text-red-600 bg-red-50 rounded-lg p-4">
                    This applicant has not uploaded a resume yet.
                </div>
                </div>
            </div>
            )}
        </ResumeModal>
        </>
    );
}