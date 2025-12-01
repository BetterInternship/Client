import { EmployerApplication, InternshipPreferences, PublicUser } from "@/lib/db/db.types";
import { ActionItem } from "@/components/ui/action-item";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { getFullName } from "@/lib/profile";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFile } from "@/hooks/use-file";
import { ArrowLeft, Award, MessageCircle, } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserPfp } from "@/components/shared/pfp";
import { fmtISO, formatMonth, formatTimestampDate } from "@/lib/utils/date-utils";
import { useDbRefs } from "@/lib/db/use-refs";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { statusMap } from "@/components/common/status-icon-map";

interface ApplicantPageProps {
    application: EmployerApplication | undefined;
    statuses: ActionItem[];
    onStatusChange?: (status: number) => void;
    onStatusButtonClick?: (id: string, status: number) => void;
    openChatModal?: () => void;
}

export function ApplicantPage({
    application,
    statuses,
    onStatusChange,
    onStatusButtonClick,
    openChatModal,
}:ApplicantPageProps) {
    const router = useRouter();
    const user = application?.user as Partial<PublicUser>;
    const internshipPreferences = user?.internship_preferences;
    const {
        to_job_type_name,
        to_university_name,
        job_modes,
        job_types,
        job_categories,
        get_app_status,
      } = useDbRefs();

    const currentStatusId = application?.status?.toString() ?? "0";
      const defaultStatus: ActionItem = {
        id: currentStatusId,
        label: get_app_status(application?.status!)?.name,
        active: true,
        disabled: false,
        destructive: false,
        highlighted: true,
        highlightColor: statusMap.get(application?.status!)?.bgColor,
      };

      const { url: resumeURL, sync: syncResumeURL } = useFile({
          fetcher: useCallback(
            async () =>
              await UserService.getUserResumeURL(application?.user_id ?? ""),
            [user?.id],
          ),
          route: application
            ? `/users/${user?.id}/resume`
            : "",
        });

        useEffect(() => {
            if (application?.user_id) {
              syncResumeURL();
            }
          }, [application?.user_id, syncResumeURL]);

    return(
        <div>
            <button
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                onClick={() => router.push(`/dashboard/manage?jobId=${application?.job_id}`)}
                >
                    <ArrowLeft className="s-8" />
            </button>
            <div className="flex max-w-7xl w-full">
                <div className="bg-white rounded-[0.33em] p-4 border border-gray-200">
                    <div>
                        <p className="text-gray-600">Applying for {application?.job?.title}</p>
                        <div className="flex">
                            <UserPfp user_id={user?.id || ""} size="20"/>
                            <div>
                                <h3 className="text-2xl">{getFullName(application?.user)}</h3>
                                {user?.internship_preferences?.internship_type ==
                                    "credited" && (
                                    <div className="flex justify-center sm:justify-start">
                                        <span className="inline-flex items-center gap-1 sm:gap-2 text-green-700 bg-green-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-2 rounded-full text-xs sm:text-sm font-medium">
                                            <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Credited internship
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 my-2">
                            <button className="flex items-center gap-2 text-sm text-gray-600 rounded-[0.33em] p-1.5 px-2 border border-gray-300">
                                <MessageCircle className="h-5 w-5"/> Chat
                            </button>
                            <DropdownMenu
                                items={statuses}
                                defaultItem={defaultStatus}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4 sm:mb-5">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                Academic Background
                            </h3>
                        </div>
                    
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-gray-500">Program / Degree</p>
                                <p className="font-medium text-gray-900">{user?.degree}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Institution</p>
                                <p className="font-medium text-gray-900">
                                    {to_university_name(user?.university)}
                                </p>
                            </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Expected Graduation Date
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {formatMonth(user?.expected_graduation_date)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">
                                      {user?.email || "Not provided"}
                                    </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Links */}
                    <div className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4 sm:mb-5">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                            Contact & Professional Links
                        </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-900">
                            {user?.phone_number || "Not provided"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Portfolio</p>
                            {user?.portfolio_link ? (
                            <a
                                href={user?.portfolio_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                            >
                                View Portfolio
                            </a>
                            ) : (
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                Not provided
                            </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">GitHub</p>
                            {user?.github_link ? (
                            <a
                                href={user?.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                            >
                                View GitHub
                            </a>
                            ) : (
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                Not provided
                            </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">LinkedIn</p>
                            {user?.linkedin_link ? (
                            <a
                                href={user?.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                            >
                                View LinkedIn
                            </a>
                            ) : (
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                Not provided
                            </p>
                            )}
                        </div>
                        </div>
                    </div>


                </div>

                {/* resume */}
                    <div>
                        {application?.user?.resume ? (
                        <div className="h-full flex flex-col">
                            <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-600">
                            {/* {getFullName(application?.user)} - Resume */} Resume
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
                </div>
            </div>
        </div>
    );
}