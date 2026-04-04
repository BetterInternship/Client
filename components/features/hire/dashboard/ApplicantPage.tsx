import { statusMap } from "@/components/common/status-icon-map";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { UserPfp } from "@/components/shared/pfp";
import { ActionItem } from "@/components/ui/action-item";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { HorizontalCollapsible } from "@/components/ui/horizontal-collapse";
import { useFile } from "@/hooks/use-file";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { formatMonth, formatTimestampDate } from "@/lib/utils/date-utils";
import {
  ArrowLeft,
  Award,
  FileText,
  Phone,
  Mail,
  BriefcaseBusiness,
  Github,
  Linkedin,
  Archive,
  HandHelping,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { Loader } from "@/components/ui/loader";
import { useProfile, useEmployerApplications } from "@/hooks/use-employer-api";
import { motion } from "framer-motion";
import { useAuthContext } from "@/app/hire/authctx";
import { ActionButton } from "@/components/ui/action-button";

interface ApplicantPageProps {
  application: EmployerApplication | undefined;
  jobID?: string | undefined;
  userApplications?: EmployerApplication[] | undefined;
  statuses: ActionItem[];
  onArchive?: () => void;
  onDelete?: () => void;
}

export function ApplicantPage({
  application,
  jobID,
  userApplications,
  statuses,
  onArchive,
  onDelete,
}: ApplicantPageProps) {
  const router = useRouter();
  const user = application?.user as Partial<PublicUser>;
  const internshipPreferences = user?.internship_preferences;
  const challengeSubmission = application?.challenge_submission?.trim() ?? "";
  const hasChallengeSubmission = challengeSubmission.length > 0;
  const applications = useEmployerApplications();

  const profile = useProfile();

  const { isMobile } = useAppContext();
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();

  redirectIfNotLoggedIn();

  const [conversationId, setConversationId] = useState("");
  const conversations = useConversations();
  const updateConversationId = (userId: string) => {
    let userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(userId),
    );
    setConversationId(userConversation?.id);
  };

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [lastSending, setLastSending] = useState(false);
  const [sending, setSending] = useState(false);
  const conversation = useConversation("employer", conversationId);
  const [exitingBack, setExitingBack] = useState(false);

  const { to_university_name, get_app_status } = useDbRefs();

  const endSend = () => {
    setSending(false);
    setTimeout(() => {
      chatAnchorRef.current?.scrollIntoView({ behavior: "instant" });
    }, 100);
  };

  useEffect(() => {
    updateConversationId(application?.user_id || "");
  }, [application?.user_id]);

  useEffect(() => {
    setLastSending(sending);
  }, [sending]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!sending && !lastSending)
      timeout = setTimeout(() => messageInputRef.current?.focus(), 200);
    return () => timeout && clearTimeout(timeout);
  }, [lastSending]);

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

  const {
    url: resumeURL,
    sync: syncResumeURL,
    loading: resumeLoading,
  } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(application?.user_id ?? ""),
      [user?.id],
    ),
    route: application ? `/users/${user?.id}/resume` : "",
  });

  const handleBack = () => {
    setExitingBack(true);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (application?.user_id) {
      syncResumeURL();
    }
  }, [application?.user_id, syncResumeURL]);

  if (loading || resumeLoading) {
    return <Loader>Getting applicant information...</Loader>;
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={
          exitingBack
            ? { scale: 0.98, filter: "blur(4px)", opacity: 0 }
            : { scale: 1, filter: "blur(0px)", opacity: 1 }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <button
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors my-4 pl-4"
          onClick={handleBack}
        >
          <ArrowLeft className="s-8" />
        </button>
        <div className="lg:flex w-full justify-center">
          <div
            className={cn(
              "bg-white rounded-[0.33em] border border-gray-200",
              isMobile ? "p-4" : "w-[50%] p-6",
            )}
          >
            {/* "header" ish portion */}
            <div className="">
              <div className="lg:flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn("relative", isMobile ? "mr-2" : "mr-4")}>
                    <UserPfp
                      user_id={user?.id || ""}
                      size={cn(isMobile ? "16" : "20")}
                    />
                  </div>
                  <div className="mx-2">
                    <div className="flex gap-2">
                      <h3 className={cn(isMobile ? "text-lg" : "text-xl")}>
                        {getFullName(application?.user)}
                      </h3>
                      {internshipPreferences?.internship_type === "credited" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-supportive/10 rounded-md px-2 py-1 w-fit flex justify-center items-center gap-1 text-xs text-supportive">
                              <Award className="w-4 h-4" />
                              <span>Credited</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-gray-500 text-xs">
                              This applicant is looking for internships for
                              credit
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-muted rounded-md px-2 py-1 w-fit flex justify-center items-center gap-1 text-xs text-muted-foreground">
                              <HandHelping className="w-4 h-4" />
                              <span>Voluntary</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-gray-500 text-xs">
                              This applicant is looking for internships
                              voluntarily
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div
                      className={cn(
                        "items-center gap-2 text-xs text-gray-500",
                        isMobile ? "flex-col" : "flex",
                      )}
                    >
                      {/* COntact info */}
                      <div className="flex gap-1 items-center">
                        <Phone className="h-4 w-4" />
                        <p className="text-gray-500 text-xs">
                          {application?.user?.phone_number}
                        </p>
                      </div>
                      {!isMobile && (
                        <p className="text-xs text-gray-500"> | </p>
                      )}
                      <div className="flex gap-1">
                        <Mail className="h-4 w-4" />
                        <p className="text-gray-500 text-xs">
                          {application?.user?.edu_verification_email}
                        </p>
                      </div>
                    </div>

                    {/* links */}
                    <div
                      className={cn(
                        "flex gap-4 items-center",
                        isMobile ? "mt-2" : "mt-4",
                      )}
                    >
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.portfolio_link ? (
                              <a
                                href={user?.portfolio_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <BriefcaseBusiness className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <BriefcaseBusiness className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Portfolio
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.github_link ? (
                              <a
                                href={user?.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <Github className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Github
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.linkedin_link ? (
                              <a
                                href={user?.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <Linkedin className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Linkedin
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center justify-between gap-2 my-4">
              <div className="flex items-center gap-2">
                {/* <button
                                    className="flex items-center gap-2 text-sm text-gray-600 rounded-[0.33em] p-1.5 px-2 border border-gray-300 hover:text-gray-700 hover:bg-gray-100"
                                    onClick={openChatModal}
                                    >
                                    <MessageCircle className="h-5 w-5"/> Chat
                                </button> */}
                <DropdownMenu items={statuses} defaultItem={defaultStatus} />
              </div>
              <div className="flex items-center gap-2">
                {onArchive && (
                  <ActionButton
                    icon={Archive}
                    onClick={onArchive}
                    enabled={
                      application!.status !== 5 && application!.status !== 7
                    }
                  />
                )}
                {onDelete && (
                  <ActionButton
                    icon={Trash2}
                    onClick={onDelete}
                    enabled={application!.status !== 5}
                    destructive={true}
                  />
                )}
              </div>
            </div>

            {isMobile ? (
              <>
                {application!.job?.internship_preferences
                  ?.require_cover_letter ||
                  (application!.cover_letter && (
                    <HorizontalCollapsible
                      className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                      title="Cover letter"
                    >
                      <span
                        className={cn(
                          "text-sm/5",
                          application!.cover_letter?.length === 0
                            ? "text-muted-foreground"
                            : "",
                        )}
                      >
                        {application!.cover_letter?.length === 0
                          ? "The user has not provided a cover letter."
                          : application!.cover_letter}
                      </span>
                    </HorizontalCollapsible>
                  ))}
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap break-words">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <HorizontalCollapsible
                  className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                  title="Applicant Information"
                >
                  <div className="grid gap-2">
                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                      <p className={cn("text-gray-500 text-xs")}>
                        Program / Degree
                      </p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {user?.degree}
                      </p>
                    </div>
                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                      <p className={cn("text-gray-500 text-xs")}>Institution</p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {to_university_name(user?.university)}
                      </p>
                    </div>
                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                      <p className={cn("text-gray-500 text-xs")}>
                        Expected Graduation Date
                      </p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {formatMonth(user?.expected_graduation_date)}
                      </p>
                    </div>
                  </div>
                </HorizontalCollapsible>

                <HorizontalCollapsible
                  className="bg-gray-50 rounded-[0.33em] p-4 border border-gray-200 mt-2"
                  title="Internship Requirements"
                >
                  <div className="grid gap-2">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div
                        className={cn(isMobile ? "flex justify-between" : "")}
                      >
                        <p className={cn("text-gray-500 text-xs")}>
                          Expected Start Date
                        </p>
                        <p className="text-xs font-medium text-gray-900">
                          {formatTimestampDate(
                            internshipPreferences?.expected_start_date,
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">
                          Expected Duration (Hours)
                        </p>
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
                {application!.job?.internship_preferences
                  ?.require_cover_letter ||
                  (application!.cover_letter && (
                    <HorizontalCollapsible
                      className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                      title="Cover letter"
                    >
                      <span
                        className={cn(
                          "text-sm/5",
                          application!.cover_letter?.length === 0
                            ? "text-muted-foreground"
                            : "",
                        )}
                      >
                        {application!.cover_letter?.length === 0
                          ? "The user has not provided a cover letter."
                          : application!.cover_letter}
                      </span>
                    </HorizontalCollapsible>
                  ))}
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap break-words">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <div className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                  {application?.user?.bio ? (
                    <div>
                      <p className="text-xs">{application?.user?.bio}</p>
                      <Divider />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs">Applicant has not added a bio.</p>
                      <Divider />
                    </div>
                  )}
                  <div className="items-center gap-3 mb-4 sm:mb-5">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Applicant Information
                    </h3>
                    {jobID && (
                      <p className="text-xs text-gray-500 mb-2">
                        Applying for: {application?.job?.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className={cn("text-gray-500 text-xs")}>Education</p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {to_university_name(user?.university)}
                      </p>
                      <p className="text-xs text-gray-500">{user?.degree}</p>
                    </div>
                    <div>
                      <p className={cn("text-gray-500 text-xs")}>
                        Expected Graduation Date
                      </p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
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
                      <p
                        className={cn(
                          "text-gray-500",
                          isMobile ? "text-sm" : "text-xs",
                        )}
                      >
                        Expected Start Date
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTimestampDate(
                          internshipPreferences?.expected_start_date,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Expected Duration (Hours)
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {internshipPreferences?.expected_duration_hours}
                      </p>
                    </div>
                  </div>
                </div>

                {/* other roles *note: will make this look better */}
                <div className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    {jobID ? (
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Other Applied Roles
                      </h3>
                    ) : (
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Applied Roles
                      </h3>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userApplications?.length !== 0 ? (
                      userApplications?.map((a) => (
                        <Badge>
                          <p className="inline-flex items-center text-gray-500 text-xs">
                            {a.job?.title}
                          </p>
                        </Badge>
                      ))
                    ) : (
                      <>
                        {jobID ? (
                          <p className="text-gray-500 text-sm">
                            {" "}
                            No applied roles
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            {" "}
                            No other applied roles
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* resume */}
          {application?.user?.resume ? (
            <div
              className={cn(
                "h-full flex flex-col justify-center items-center",
                isMobile ? "mt-4 w-full" : "",
              )}
            >
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
      </motion.div>
    </>
  );
}
