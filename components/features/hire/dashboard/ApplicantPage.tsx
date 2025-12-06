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
import { ArrowLeft, Award, FileText, MessageCircle, Phone, Mail, BriefcaseBusiness, Github, Linkedin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";

interface ApplicantPageProps {
    application: EmployerApplication | undefined;
    jobID: string | undefined;
    userApplications?: EmployerApplication[] | undefined;
    statuses: ActionItem[];
    openChatModal?: () => void;
    prevPage?: string;
}

export function ApplicantPage({
    application,
    jobID,
    userApplications,
    statuses,
    openChatModal,
    prevPage
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

        const handleBack = () => {
            if(!prevPage) return;

            if(prevPage === "chat"){
                router.push(`/conversations?userId=${application?.user_id}`)
            } else if (prevPage === "job") {
                router.push(`/dashboard/manage?jobId=${application?.job_id}`)
            }
        }

        useEffect(() => {
            if (application?.user_id) {
              syncResumeURL();
            }
          }, [application?.user_id, syncResumeURL]);

    return(
        <div className="">
            <button
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors my-4"
                onClick={() => router.push(`/dashboard/manage?jobId=${jobID}`)}
                >
                    <ArrowLeft className="s-8" />
            </button>
            <div className="lg:flex w-full justify-center">
                <div className={cn("bg-white rounded-[0.33em] border border-gray-200", isMobile ? "p-4" : "w-[80vh] p-6")}>
                    {/* "header" ish portion */}
                    <div className="">
                        <div className="lg:flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={cn("relative", isMobile ? "mr-2" : "mr-4")}>
                                    <UserPfp user_id={user?.id || ""} size={cn(isMobile ? "16" : "20")}/>
                                    {internshipPreferences?.internship_type ==
                                        "credited" && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                            <Award className="w-4 h-4 text-white" />
                                        </div>)
                                    }
                                </div>
                                <div className="mx-2">
                                    <h3 className={cn(isMobile? "text-lg" : "text-xl")}>{getFullName(application?.user)}</h3>
                                    <div className={cn("items-center gap-2 text-xs text-gray-500", isMobile ? "" : "flex")}>
                                        {/* COntact info */}
                                        <div className="flex gap-1 items-center">
                                            <Phone className="h-4 w-4"/>
                                            <p className="text-gray-500 text-xs">{application?.user?.phone_number}</p>
                                        </div>
                                        {!isMobile && <p className="text-xs text-gray-500"> | </p>}
                                        <div className="flex gap-1">
                                            <Mail className="h-4 w-4"/>
                                            <p className="text-gray-500 text-xs">{application?.user?.edu_verification_email}</p>
                                        </div>
                                    </div>

                                    {/* links */}
                                    <div className={cn("flex gap-4 items-center", isMobile ? "mt-2" : "mt-4")}>
                                        <div>
                                            {user?.portfolio_link ? (
                                            <a
                                                href={user?.portfolio_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                                            >
                                                <BriefcaseBusiness className="h-4 w-4"/>
                                            </a>) : (
                                                <p
                                                className="text-gray-300 font-medium break-all text-xs cursor-default"
                                                >
                                                    <BriefcaseBusiness className="h-4 w-4"/>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            {user?.github_link ? (
                                            <a
                                                href={user?.github_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                                            >
                                                <Github className="h-4 w-4"/>
                                            </a>) : (
                                                <p
                                                className="text-gray-300 font-medium break-all text-xs cursor-default"
                                                >
                                                    <Github className="h-4 w-4"/>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            {user?.linkedin_link ? (
                                            <a
                                                href={user?.linkedin_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                                            >
                                                <Linkedin className="h-4 w-4"/>
                                            </a>) : (
                                                <p
                                                className="text-gray-300 font-medium break-all text-xs cursor-default"
                                                >
                                                    <Linkedin className="h-4 w-4"/>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* actions */}
                        <div className={cn("flex items-center gap-2 my-4", isMobile ? "justify-start" : "justify-start")}>
                            <button
                                className="flex items-center gap-2 text-sm text-gray-600 rounded-[0.33em] p-1.5 px-2 border border-gray-300 hover:text-gray-700 hover:bg-gray-100"
                                onClick={() => router.push(`/conversations?userId=${user.id}`)}
                                >
                                    <MessageCircle className="h-5 w-5"/> Chat
                                </button>
                                <DropdownMenu
                                    items={statuses}
                                    defaultItem={defaultStatus}
                                />
                            </div>
                    

                    {isMobile ? (
                        <>
                            <HorizontalCollapsible
                            className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200 mt-4"
                            title="Applicant Information"
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
                        </>
                        
                    ) : (
                        <>
                            <div className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200 mt-4">
                                    {application?.user?.bio ? (
                                        <div>
                                            <p className="text-xs">{application?.user?.bio}</p>
                                            <Divider/>
                                        </div>
                                    ) : (

                                        <div>
                                            <p className="text-xs">Applicant has not added a bio.</p>
                                            <Divider/>
                                        </div>
                                        
                                    )}
                                <div className="items-center gap-3 mb-4 sm:mb-5">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Applicant Information
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2">Applying for: {application?.job?.title}</p>
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
                                </div>
                                <Divider />
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

                            {/* other roles *note: will make this look better */}
                            <div className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                            Other Applied Roles
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {userApplications?.length !== 0 ? (
                                            userApplications?.map((a) => 
                                            <Badge>
                                                <p className="inline-flex items-center text-gray-500 text-xs">
                                                    {a.job?.title}
                                                </p>
                                            </Badge>
                                            
                                        )) : (
                                            <p className="text-gray-500 text-sm"> No other applied roles</p>
                                        )
                                        }
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