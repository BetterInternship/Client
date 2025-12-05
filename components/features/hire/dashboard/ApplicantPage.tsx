import { statusMap } from "@/components/common/status-icon-map";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { UserPfp } from "@/components/shared/pfp";
import { ActionItem } from "@/components/ui/action-item";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { HorizontalCollapsible } from "@/components/ui/horizontal-collapse";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { formatMonth, formatTimestampDate } from "@/lib/utils/date-utils";
import { ArrowLeft, Award, FileText, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

interface ApplicantPageProps {
    application: EmployerApplication | undefined;
    userApplications?: EmployerApplication[] | undefined;
    statuses: ActionItem[];
    openChatModal?: () => void;
}

export function ApplicantPage({
    application,
    userApplications,
    statuses,
    openChatModal,
}:ApplicantPageProps) {
    const router = useRouter();
    const user = application?.user as Partial<PublicUser>;
    const internshipPreferences = user?.internship_preferences;

    const { isMobile } = useAppContext();

    const {
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
        <div className="">
            <button
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors my-4"
                onClick={() => router.push(`/dashboard/manage?jobId=${application?.job_id}`)}
                >
                    <ArrowLeft className="s-8" />
            </button>
            <div className="lg:flex w-full justify-center">
                <div className={cn("bg-white rounded-[0.33em] border border-gray-200", isMobile ? "p-4" : "w-[80vh] p-6")}>
                    {/* "header" ish portion */}
                    <div className="">
                        <div className="lg:flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="mr-4">
                                    <UserPfp user_id={user?.id || ""} size="20"/>
                                </div>
                                <div className="mx-2">
                                    <h3 className="text-xl">{getFullName(application?.user)}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Applying for: {application?.job?.title}</p>
                                    {internshipPreferences?.internship_type ==
                                        "credited" && (
                                        <div className="flex justify-start">
                                            <span className="inline-flex items-center gap-1 sm:gap-2 text-green-700 bg-green-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-2 rounded-full text-xs font-medium">
                                                <Award className="w-3 h-3" />
                                                Credited internship
                                            </span>
                                        </div>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* actions */}
                            <div className={cn("flex items-center gap-2 my-4", isMobile ? "justify-start" : "justify-start")}>
                                <button className="flex items-center gap-2 text-sm text-gray-600 rounded-[0.33em] p-1.5 px-2 border border-gray-300 hover:text-gray-700 hover:bg-gray-100">
                                    <MessageCircle className="h-5 w-5"/> Chat
                                </button>
                                <DropdownMenu
                                    items={statuses}
                                    defaultItem={defaultStatus}
                                />
                            </div>
                    
                    {/* other roles *note: will make this look better */}
                        <div className="flex my-2 mt-4">
                            <p className="text-sm text-gray-500">Other roles applied for: </p>
                                <div className="flex">
                                    {userApplications?.length !== 0 ? (
                                        userApplications?.map((a) => 
                                        <p className="text-gray-500 text-sm ml-1">
                                            {a.job?.title}
                                            {a !== userApplications?.at(-1) && <>, </>}
                                        </p>
                                    )) : (
                                        <p className="text-gray-500 text-sm"> No other applied roles</p>
                                    )
                                    }
                                </div>
                        </div>

                    {isMobile ? (
                        <>
                            <HorizontalCollapsible
                            className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200 mt-4"
                            title="Academic Information"
                            >
                                <div className="grid gap-2">
                                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                                        <p className={cn("text-gray-500 text-xs")}>Program / Degree</p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>{user?.degree}</p>
                                    </div>
                                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                                        <p className={cn("text-gray-500 text-xs")}>Institution</p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>
                                            {to_university_name(user?.university)}
                                        </p>
                                    </div >
                                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                                        <p className={cn("text-gray-500 text-xs")}>
                                            Expected Graduation Date
                                        </p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>
                                            {formatMonth(user?.expected_graduation_date)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className={cn("text-gray-500 text-xs")}>Email</p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>
                                            {user?.email || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-500">Phone Number</p>
                                        <p className="text-xs font-medium text-gray-900">
                                        {user?.phone_number || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </HorizontalCollapsible>

                            <HorizontalCollapsible
                            className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200 mt-2"
                            title= "Internship Requirements"
                            >
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div className={cn(isMobile ? "flex justify-between" : "")}>
                                            <p className={cn("text-gray-500 text-xs")}>Expected Start Date</p>
                                            <p className="text-xs font-medium text-gray-900">{formatTimestampDate(internshipPreferences?.expected_start_date)}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-xs text-gray-500">Expected Duration (Hours)</p>
                                            <p className="text-xs font-medium text-gray-900">
                                                {internshipPreferences?.expected_duration_hours}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </HorizontalCollapsible>
                            
                            <HorizontalCollapsible
                            className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200 mt-2"
                            title="Professional Links"
                            >
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-500">Portfolio</p>
                                        {user?.portfolio_link ? (
                                        <a
                                            href={user?.portfolio_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium break-all text-xs"
                                        >
                                            View Portfolio
                                        </a>
                                        ) : (
                                        <p className="text-xs font-medium text-gray-900">
                                            Not provided
                                        </p>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-500">GitHub</p>
                                        {user?.github_link ? (
                                        <a
                                            href={user?.github_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium break-all text-xs"
                                        >
                                            View GitHub
                                        </a>
                                        ) : (
                                        <p className="font-medium text-gray-900 text-xs">
                                            Not provided
                                        </p>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-500">LinkedIn</p>
                                        {user?.linkedin_link ? (
                                        <a
                                            href={user?.linkedin_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium break-all text-xs"
                                        >
                                            View LinkedIn
                                        </a>
                                        ) : (
                                        <p className="font-medium text-gray-900 text-xs">
                                            Not provided
                                        </p>
                                        )}
                                    </div>
                                    </div>
                                </div>
                            </HorizontalCollapsible>
                        </>
                        
                    ) : (
                        <>
                            <div className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200 mt-4">
                                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Academic Information
                                    </h3>
                                </div>
                            
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div>
                                        <p className={cn("text-gray-500 text-xs")}>Education</p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>{to_university_name(user?.university)}</p>
                                        <p className="text-xs text-gray-500">{user?.degree}</p>
                                    </div>
                                    <div>
                                        <p className={cn("text-gray-500 text-xs")}>
                                            Expected Graduation Date
                                        </p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>
                                            {formatMonth(user?.expected_graduation_date)}
                                        </p>
                                    </div>
                                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                                        <p className={cn("text-gray-500 text-xs")}>Email</p>
                                        <p className={cn("font-medium text-gray-900", isMobile ? "text-xs" : "text-sm")}>
                                            {user?.email || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phone Number</p>
                                        <p className="text-sm font-medium text-gray-900">
                                        {user?.phone_number || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200 mt-2">
                                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Internship Requirements
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                                        <p className={cn("text-gray-500", isMobile ? "text-sm" : "text-xs")}>Expected Start Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatTimestampDate(internshipPreferences?.expected_start_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Expected Duration (Hours)</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {internshipPreferences?.expected_duration_hours}
                                        </p>
                                    </div>
                                    </div>
                                </div>

                                {/* Contact & Links */}
                                <div className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200 mt-2">
                                    {/* <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Contact & Professional Links
                                    </h3>
                                    </div> */}
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Portfolio</p>
                                        {user?.portfolio_link ? (
                                        <a
                                            href={user?.portfolio_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium break-all text-sm"
                                        >
                                            View Portfolio
                                        </a>
                                        ) : (
                                        <p className="text-sm font-medium text-gray-900">
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
                                            className="text-blue-600 hover:underline font-medium break-all text-sm"
                                        >
                                            View GitHub
                                        </a>
                                        ) : (
                                        <p className="font-medium text-gray-900 text-sm">
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
                                            className="text-blue-600 hover:underline font-medium break-all text-sm"
                                        >
                                            View LinkedIn
                                        </a>
                                        ) : (
                                        <p className="font-medium text-gray-900 text-sm">
                                            Not provided
                                        </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* resume */}
                    {application?.user?.resume ? (
                        <div className={cn("h-full flex flex-col justify-center items-center", isMobile ? "mt-4 w-full" : "")}>
                            {/* <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-600">
                            Resume
                            </h1> */}
                            <PDFPreview url={resumeURL} />
                        </div>
                        ) : (
                        <div className="flex flex-col items-center justify-center h-96 px-8 w-full">
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
    );
}