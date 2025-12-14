import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useAuthContext } from "@/lib/ctx-auth";
import { Card } from "@/components/ui/card";
import { EmployerPfp, UserPfp } from "@/components/shared/pfp";
import { ChevronLeft,
        ChevronRight,
        SendHorizonal,
        Plus,
        CircleEllipsis,
        FileUser,
        Calendar,
        ContactRound,
        GraduationCap,
        ListCheck,
        MessageCircle,
        School,
        FileText,
        Award,
       } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { Ref, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/messages";
import { Button } from "@/components/ui/button";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { Loader } from "@/components/ui/loader";
import { useProfile, useEmployerApplications } from "@/hooks/use-employer-api";
import { useUserName, getUserById } from "@/hooks/use-student-api";
import { Badge } from "@/components/ui/badge";
import { getFullName } from "@/lib/profile";
import { FilterButton } from "@/components/ui/filter";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { fmtISO } from "@/lib/utils/date-utils";
import { useModal } from "@/hooks/use-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { useFile } from "@/hooks/use-file";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";


interface ConversationProps {
    applicantId?: string;
};

interface InternshipPreferences {
  expected_duration_hours?: number,
  expected_start_date?: number,
  internship_type?: string,
  job_category_ids?: string[],
  job_commitment_ids?: string[],
  job_setup_ids?: string[],
}
interface Message {
  sender_id: string;
  message: string;
  timestamp: string;
}

interface Conversation {
    messages: Message[];
    senderId: string;
    loading: boolean;
    unsubscribe: Function;
}

export function ConversationPage({
    applicantId,
} : ConversationProps) {
    const { redirectIfNotLoggedIn } = useAuthContext();
    const profile = useProfile();
    const conversations = useConversations();
    const applications = useEmployerApplications();
    const { unreads } = useConversations();
    const { isMobile } = useAppContext();
    const router = useRouter();

    // selection + message composing state
    const [conversationId, setConversationId] = useState("");
    const conversation = useConversation("employer", conversationId);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    //for filtering
    const [chatFilter, setChatFilter] = useState<"all" | "unread">("all")

    // mobile "router": list or chat
    const [mobileView, setMobileView] = useState<"list" | "chat" | "profile">("list");

    // open and close profile view
    const [profileView, setProfileView] = useState(false);
    const [ellipsisState, setEllipsisState] = useState(true);

    // checking if user data jis fully loaded
    const [userDataLoading, setUserDataLoading] = useState(true);

    // anchor for autoscroll
    const chatAnchorRef = useRef<HTMLDivElement>(null);

    //redirectIfNotLoggedIn();

    // auto-switch to chat view on mobile when a conversation is selected
    useEffect(() => {
        if (isMobile && conversationId) setMobileView("chat");
    }, [isMobile, conversationId]);

    // unsubscribe on conversation change (keeps your original behavior)
    useEffect(() => {
        if (conversationId) {
            conversation.unsubscribe();
        }
    }, [conversationId]);

    useEffect(() => {
        if(conversationId && ellipsisState) {
            setProfileView(true);
        } 
    }, [conversationId]);

    //scroll to bottom of the chat if messages exist
    useEffect(() => {
    if (conversationId && !conversation.loading && conversation.messages?.length) {
        chatAnchorRef.current?.scrollIntoView({ behavior: "instant" });
    }
    }, [conversationId, conversation.messages?.length, conversation.loading]);

    useEffect(() => {
        if (applicantId && conversations.data) {
            const findChat = conversations.data.find((convo) => 
                convo.subscribers?.includes(applicantId)
            );
            
            if (findChat?.id) {
                setConversationId(findChat.id);
                router.replace('/conversations', { scroll: false });
            } else {
                console.log("L bozo no new chat page zzz")
            }
        }
    }, [applicantId, conversations.data]);


    const sortedConvos = useMemo(
        () =>
        (conversations.data?.filter((c, index, self) => (c?.subscribers?.length > 1) && 
        index === self.findIndex((ca) => (
            ca.id === c.id
        ))) 
        ?? []).toSorted(
            (a, b) =>
            (b.last_unread?.timestamp ?? 0) - (a.last_unread?.timestamp ?? 0)
        ),
        [conversations.data],
    );

    const sortedUnreads = useMemo(
        () =>
        (unreads.filter((c, index, self) => (c?.subscribers?.length > 1) && 
        index === self.findIndex((ca) => (
            ca.id === c.id
        ))) ?? []).toSorted(
            (a, b) =>
            (b.last_unread?.timestamp ?? 0) - (a.last_unread?.timestamp ?? 0),
        ),
        [unreads],
    );

    const uniqueChats = useMemo(() => {
        return chatFilter === "all" ? sortedConvos : sortedUnreads
    }, [chatFilter, sortedConvos, unreads]);

    const visibleConvos = Array.from(new Set(uniqueChats));

    const endSend = () => {
        setMessage("");
        setSending(false);
        chatAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle message
    const handleMessage = async (studentId: string | undefined, message: string) => {
        if (message.trim() === "") return;

        setSending(true);
        let userConversation = conversations.data?.find((c) =>
        c?.subscribers?.includes(studentId),
        );

        setTimeout(async () => {
        if (!userConversation) return endSend();
        await EmployerConversationService.sendToUser(
            userConversation?.id,
            message,
        ).catch(endSend);
        endSend();
        });
    };

    const hasConversations = (conversations.data?.length ?? 0) > 0;

    // determine if all user data is loaded before loading entire page
    useEffect(() => {
        if (!conversations.data && hasConversations) {
            setUserDataLoading(true);
            return;
        }

        const allUsersLoaded = visibleConvos.every((convo) => {
            const userId = convo?.subscribers?.find(
                (id: string) => id !== profile.data?.id
            );
            return userId;
        });

        if (allUsersLoaded) {
            const timer = setTimeout(() => {
                setUserDataLoading(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [conversations.data, visibleConvos, profile.data?.id]);

    return (
        <>
            {userDataLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Conversations...</p>
                    </div>
                </div>
            ) : (
                <div 
                    className="w-full h-full flex flex-col md:flex-row overflow-hidden"
                >
                    {hasConversations ? (
                    <>
                        {/* ===== Left: List (Desktop always visible; Mobile only when in "list" view) ===== */}
                        <aside
                        className={cn(
                            "border-r border-gray-200 md:min-w-[25%] md:max-w-[25%] h-full flex flex-col overflow-hidden",
                            // mobile: show only when in list mode
                            "md:relative",
                            isMobile ? (mobileView === "list" ? "block" : "hidden") : "block",
                        )}
                        >
                        <div className="shrink-0">
                            <ConversationFilter 
                            conversations={sortedConvos}
                            unreadConvosCount={sortedUnreads.length}
                            status={chatFilter}
                            onFilterChange={(status:string) => setChatFilter(status as "all" | "unread")}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                            { visibleConvos.length ? (
                            <ConversationList
                            conversations={visibleConvos}
                            unreadConversations={sortedUnreads}
                            profileId={profile.data?.id}
                            onPick={(id) => setConversationId(id)}
                            currId={conversationId}
                            />
                            ) : (
                            <div className="grid place-items-center mt-[30vh]">
                                <p className="text-gray-500">No unread conversation.</p>
                            </div>
                            )
                            }
                        </div>
                        </aside>

                        {/* ===== Right: Chat (Desktop always visible; Mobile only when in "chat" view) ===== */}
                        <section
                        className={cn(
                            "flex-1 flex flex-col h-full overflow-hidden",
                            isMobile ? (mobileView === "chat" ? "flex" : "hidden") : "flex",
                        )}
                        >
                        

                        {/* Chat body */}
                        {conversation?.loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading Conversation...</p>
                                </div>
                            </div>
                        ) : conversationId ? (
                            <>
                            {/*top bar */}
                            <div className="flex justify-between sticky shrink-0 top-0 z-10 px-3 py-2 border-b bg-white/90 backdrop-blur">
                                <div className="flex items-center gap-2 min-w-0">
                                {isMobile && (
                                    <button
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 shrink-0"
                                    onClick={() => {
                                        setMobileView("list");
                                        setConversationId("");
                                    }}
                                    aria-label="Back to conversations"
                                    >
                                    <ChevronLeft className="h-5 w-5" />
                                    </button>
                                )}
                                <ChatHeaderTitle 
                                conversation={conversation} 
                                applications={applications.employer_applications}
                                />
                                </div>
                                <button
                                onClick={() => {
                                setEllipsisState(!ellipsisState);
                                setProfileView(!profileView);
                                if (isMobile && !profileView) {
                                    setMobileView("profile");
                                }
                                }}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 mt-1 shrink-0">
                                <CircleEllipsis className="h-6 w-6"/>
                                </button>
                            </div>
                            <div className="flex-1 min-h-0 overflow-auto">
                                <ConversationPane
                                    conversation={conversation}
                                    chatAnchorRef={chatAnchorRef}
                                />
                            </div>
                            <ComposerBar
                                disabled={sending || conversation.loading}
                                value={message}
                                onChange={setMessage}
                                onSend={async () => {
                                    handleMessage(conversation.senderId, message)
                                }}
                            />
                            </>
                        ) : (
                            <EmptyChatHint />
                        )}
                        </section>

                        {profileView && 
                        <aside className={cn(
                            "border-l border-gray-200 md:min-w-[25%] md:max-w-[25%] md:block h-full flex flex-col overflow-hidden",
                            isMobile ? (mobileView === "profile" ? "block" : "hidden") : "block"
                        )}>
                            {isMobile && (
                            <div className="bg-white w-full flex items-start">
                                <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
                                onClick={() => {
                                    setMobileView("chat");
                                    setConversationId(conversationId);
                                    setProfileView(false);
                                }}
                                    aria-label="Back to previous conversation"
                                >
                                <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>
                            )}
                            <AnimatePresence mode="wait">
                                <motion.div 
                                className="bg-white h-full p-8"
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <ConversationProfile
                                    conversation={conversation}
                                    profileId={conversation.senderId}
                                    applications={applications.employer_applications}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </aside>
                        }
                    </>
                    ) : (
                    <NoConversationsEmptyState />
                    )}
                </div>
            )}
        </>
    );
    }

    /* ======================= Subcomponents ======================= */

    function ConversationFilter({
    conversations,
    unreadConvosCount,
    status,
    onFilterChange,
    }: 
    {
    conversations: any[];
    unreadConvosCount: number;
    status: string;
    onFilterChange: (status: string) => void;}) {

        return (
        <div className="flex p-2 gap-x-2 shrink-0">
            <FilterButton
                name="All"
                key="all"
                itemCount={conversations.length}
                isActive={status === "all"}
                defaultActive={true}
                onToggle={() => {
                    onFilterChange("all")
                }}
                className="text-sm rounded-full">
                </FilterButton>
                <FilterButton
                name="Unread"
                key="unread"
                itemCount={unreadConvosCount}
                isActive={status === "unread"}
                defaultActive={false}
                onToggle={() => {
                    onFilterChange("unread")
                }}
                className="text-sm rounded-full"
                >
                </FilterButton>
            </div>
        );
    }

    function ConversationProfile({
    conversation,
    profileId,
    applications,
    }: {
    conversation: any;
    profileId: string;
    applications?: EmployerApplication[];
    }) {
    const { isMobile } = useAppContext();
    const { user } = getUserById(conversation.senderId || "")
    const userName = getFullName(user || undefined)
    const userId = user?.id
    const userApplications = applications?.filter(a => profileId === a.user_id)

    const { to_university_name } = useDbRefs();
    const preferences = (user?.internship_preferences || {}) as InternshipPreferences

    const {
        open: openResumeModal,
        close: closeResumeModal,
        Modal: ResumeModal,
        } = useModal("resume-modal");

        const router = useRouter();

        const { url: resumeURL, sync: syncResumeURL } = useFile({
            fetcher: useCallback(
            async () =>
                await UserService.getUserResumeURL(user?.id ?? ""),
            [user?.id],
            ),
            route: user
            ? `/users/${user?.id}/resume`
            : "",
        });

        useEffect(() => {
            if (user?.id) {
            syncResumeURL();
            }
        }, [user?.id, syncResumeURL]);

    return(
        <>
            {user ? (
            <>
                <div className="flex flex-col items-center mt-10 w-full">
                    <UserPfp user_id={userId || ""} size="20"/>
                <h3 className="text-xl mt-2">{userName || "User"}</h3>
                {preferences?.internship_type && 
                    <div className="flex justify-start">
                        <span className="inline-flex items-center gap-1 sm:gap-2 text-green-700 bg-green-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-2 rounded-full text-sm font-medium">
                                <Award className="w-3 h-3" />
                                Credited internship
                        </span>
                    </div>
                }
            </div>
            <div className="mt-10">
                <div className={cn("flex flex-col items-center gap-2")}>
                    <button 
                    className={cn("flex items-center justify-center w-full bg-primary text-sm text-white gap-2 p-2 rounded-sm", isMobile ? "mb-2" : "")}
                    onClick={openResumeModal}
                    >
                    <FileUser className="h-5 w-5"/>
                    Resume
                    </button>
                    <button
                    className="flex items-center justify-center w-full border-2 bg-white text-sm text-primary gap-2 p-2 rounded-sm"
                    onClick={() => 
                        router.push(`dashboard/applicant?userId=${user?.id}`)
                    }
                    >
                        View Full Application
                    </button>
                </div>
                <div
                className="flex flex-col text-gray-500 text-md w-full h-[20vh] rounded-sm border mt-4 p-6"
                >
                <div className="flex items-center gap-2">
                    <School size={20} />
                    <span>
                    {to_university_name(user?.university) || ""}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <GraduationCap size={20} />
                    <span>
                    {user?.degree}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>
                    {preferences.expected_start_date ? (
                        <>
                            {fmtISO(preferences.expected_start_date.toString())}
                        </>
                        ) : (
                        <span className="text-gray-500"> No start date provided</span>
                        )}
                    </span>
                </div>
                </div>
                <div className="text-gray-500 mt-4 flex flex-wrap overflow-y-auto w-full">
                <p className="text-sm text-primary mr-1"> Applied for: </p>
                {userApplications?.map((a) => 
                    <p className="text-sm mr-1">
                    {a.job?.title}
                    {a !== userApplications?.at(-1) && <>, </>}
                    </p>
                )}
                </div>
               {/* <div className="flex-1">
                 <button 
                    className="flex w-full border border-destructive justify-center items-center text-sm text-destructive p-2 rounded-[0.33em]"
                    >
                        Delete Conversation
                    </button>
               </div> */}
            </div>

            <ResumeModal>
                {user?.resume ? (
                <div className={cn("flex flex-col",
                    isMobile ? "h-[80vh]" : "h-full"
                )}>
                    <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-900">
                    {getFullName(user)} - Resume
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
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Applicant...</p>
                </div>
            </div>
        )}
        </>
    )
    }

    function ConversationList({
    conversations,
    unreadConversations,
    profileId,
    onPick,
    currId,
    }: {
    conversations: any[];
    unreadConversations: any[];
    profileId?: string;
    onPick: (id: string) => void;
    currId: string;
    }) {

    return (
        <div className="flex flex-col overflow-auto">
        {conversations.map((c, index) => (
            <ConversationCard
            key={c.id}
            index={index}
            conversation={c}
            latestIsYou={c.last_unread?.sender_id === profileId}
            latestMessage={c.last_unread?.message}
            setConversationId={onPick}
            isUnread={
                unreadConversations.some((unreadConv) => unreadConv.id === c.id)
            }
            isPicked={currId === c.id}
            />
        ))}
        </div>
    );
    }

    function ChatHeaderTitle({ conversation, applications }: { conversation?: any, applications?:EmployerApplication[] }) {
    const { userName } = useUserName(conversation.senderId || "")
    const userApplications = applications?.filter(a => conversation.senderId === a.user_id)
    return (
        <div className="min-w-0 max-w-[33vh] shrink-0">
        <div className="font-medium truncate text-lg">
            {userName || "Conversations"}
        </div>
        <div className="text-gray-500 text-[11px] -mt-[2px] flex truncate">
            <p className="text-[11px] text-primary"> Applied for: </p>
            {userApplications?.map((a) => 
            <p className="text-[11px] ml-1">
                {a.job?.title}
                {a !== userApplications?.at(-1) && <>, </>}
            </p>
            )}
        </div>
        </div>
    );
    }



    function ComposerBar({
    value,
    onChange,
    onSend,
    disabled,
    }: {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    disabled?: boolean;
    }) {
    return (
        <div
        className={cn(
            "shrink-0 z-10 border-t bg-white",
            "px-2 py-2",
        )}
        >
        <div className="flex gap-2">
            <Textarea
            placeholder="Send a message here..."
            className="w-full h-10 p-3 border-gray-200 rounded-[0.33em] focus:ring-0 focus:ring-transparent resize-none text-sm overflow-y-auto"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
                }
            }}
            maxLength={1000}
            />
            <div className="flex justify-end">
            <button 
                disabled={disabled || !value.trim()}
                onClick={(e) => {
                    e.preventDefault();
                    onSend();
                }}
                className={cn("text-primary px-2",
                (disabled || !value.trim()) ? "opacity-50" : ""
                )}
            >
                <SendHorizonal className="w-7 h-7" />
            </button>
            </div>
        </div>
        </div>
    );
    }

    function EmptyChatHint() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Card className="flex flex-col items-start mx-auto max-w-prose">
            <div className="font-bold mb-1">Welcome to your conversations!</div>
            <div className="text-xs opacity-70">
            Click on a conversation to start chatting.
            </div>
        </Card>
        </div>
    );
    }

    function NoConversationsEmptyState() {
    const { isMobile } = useAppContext();
    return (
        <div className="relative w-full flex items-center animate-fade-in h-full">
        <div className="flex flex-col items-center h-fit w-full sm:w-2/3 lg:w-1/3 mx-auto pb-32 px-4">
            <div className="opacity-35 mb-10 text-center">
            <h1
                className={cn(
                "font-heading font-bold",
                isMobile ? "text-5xl" : "text-6xl",
                )}
            >
                BetterInternship
            </h1>
            <p className="mt-3 text-2xl tracking-tight">
                Better Internships Start Here
            </p>
            </div>
            <div className="text-center border border-primary/50 text-primary shadow-sm rounded-[0.33em] opacity-85 p-4 bg-white w-full">
            You currently don't have any conversations.
            </div>
        </div>
        </div>
    );
    }

    const ConversationPane = ({
    conversation,
    chatAnchorRef,
    }: {
    // keep "any" per your note; consider adding a strong type later
    conversation: Conversation;
    chatAnchorRef: Ref<HTMLDivElement>;
    }) => {
    const { isMobile } = useAppContext()
    const profile = useProfile();
    const { userName } = useUserName(conversation.senderId);
    let lastSelf = false;

    return (
        <>
            {conversation?.loading ? (
                <div className="w-full h-full mb-[50%] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading Conversation...</p>
                    </div>
                </div>
            ) : (
                <motion.div
                initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
                animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1 min-h-0 flex flex-col-reverse gap-1 p-2 overflow-y-auto"
            >
                <div ref={chatAnchorRef} />
                {conversation?.messages?.length ? (
                    <>
                        {conversation.messages
                        ?.map((message: any, idx: number) => {
                        if (!idx) lastSelf = false;
                        const oldLastSelf = lastSelf;
                        lastSelf = message.sender_id === profile.data?.id;
                        return {
                            key: idx,
                            message: message.message,
                            self: message.sender_id === profile.data?.id,
                            prevSelf: oldLastSelf,
                            them: userName,
                        };
                        })
                        ?.toReversed()
                        ?.map((d: any) => (
                            <Message
                            key={d.key}
                            message={d.message}
                            self={d.self}
                            prevSelf={d.prevSelf}
                            them={d.them}
                            />
                        ))}
                    </>
                ) : (
                <div className={cn("relative flex items-center justify-center h-full gap-4", isMobile ? "pt-60" : "pt-80")}>
                    <MessageCircle className="h-14 w-14 opacity-50"/>
                    <div className="flex flex-col text-start">
                        <p className="font-bold text-lg mb-0">No Messages Yet</p>
                        <p className="text-sm text-gray-500">Start the conversation!</p>
                    </div>
                </div>
            )}
            </motion.div>
            )}
        </>
    );
    };

    const ConversationCard = ({
    conversation,
    latestIsYou,
    latestMessage,
    setConversationId,
    isUnread,
    isPicked,
    index = 0,
    }: {
    conversation: any; // consider replacing with a proper type
    latestIsYou: boolean;
    latestMessage: string;
    setConversationId: (id: string) => void;
    isUnread?: boolean;
    isPicked: boolean;
    index?: number;
    }) => {
    const profile = useProfile();
    const [userId, setUserId] = useState("");

    const MAX_STAGGER_ROWS = 50;
    const staggerDelay = index < MAX_STAGGER_ROWS ? index * 0.05 : 0;

    useEffect(() => {
        setUserId(
        conversation?.subscribers?.find(
            (subscriberId: string) => subscriberId !== profile.data?.id,
        ) ?? "",
        );
    }, [conversation, profile.data?.id]);

    const { userName } = useUserName(userId);
    const name = userName.trim().split(" ");
    const surname = name[name.length - 1];

    return (
        <motion.div
        key={conversation.id}
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        transition={{ 
            duration: 0.5, 
            delay: staggerDelay, 
            ease: "easeOut", 
        }}
        className={cn(
            "rounded-none border-0 border-b border-gray-200 py-3 px-4 md:px-6 cursor-pointer",
            isPicked ? "bg-gray-100" : " hover:bg-gray-100"
        )}
        onMouseDown={() => setConversationId(conversation.id)}
        onTouchStart={() => setConversationId(conversation.id)}
        >
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {userName && <UserPfp user_id={userId} />}
            <div className="flex flex-col min-w-0">
                <span className={cn("font-medium flex items-center gap-2 truncate",
                isUnread ? "font-bold" : "font-medium"
                )}>
                {userName ?? "Conversation"}
                </span>
                <span className={cn("text-xs text-gray-600 line-clamp-1",
                isUnread ? "font-bold text-black" : ""
                )}>
                {latestMessage ? ((latestIsYou ? "You: " : surname + ": ") + (latestMessage ?? "")) :
                ("No message history")}
                </span>
            </div>
            </div>
            {isUnread ? (
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            ):(
            <></>
            )}
        </div>
    </motion.div>
    );
};
