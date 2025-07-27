"use client";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useAuthContext } from "@/lib/ctx-auth";
import { Card } from "@/components/ui/our-card";
import { Employer } from "../../../lib/db/db.types";
import { EmployerPfp } from "@/components/shared/pfp";
import { ChevronRight, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { Ref, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/messages";
import { Button } from "@/components/ui/button";
import { UserConversationService } from "@/lib/api/services";
import { useProfile } from "@/lib/api/student.api";
import { Loader } from "@/components/ui/loader";
import { useEmployerName } from "@/hooks/use-employer-api";
import { Badge } from "@/components/ui/badge";

export default function ConversationsPage() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfile();
  const [conversationId, setConversationId] = useState("");
  const conversations = useConversations();
  const conversation = useConversation("user", conversationId);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useAppContext();

  redirectIfNotLoggedIn();

  const endSend = () => {
    setMessage("");
    setSending(false);
    chatAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMessage = async (employerId: string, message: string) => {
    if (message.trim() === "") return;

    setSending(true);
    const employerConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(employerId)
    );

    // Create convo if it doesn't exist first
    if (!employerConversation) return endSend();
    const response = await UserConversationService.sendToEmployer(
      employerConversation?.id,
      message
    ).catch(endSend);
    endSend();
  };

  useEffect(() => {
    conversation.unsubscribe();
  }, [conversationId]);

  if (conversations.loading)
    return <Loader>Loading your conversations...</Loader>;

  return (
    <div className="w-full h-full flex flex-row">
      {conversations.data?.length && !conversations.loading ? (
        <div className="w-full flex flex-row animate-fade-in h-full ">
          {/* Side Panel */}
          <div className="min-w-[25%] border-r border-r-gray-300 h-full max-h-full overflow-y-auto">
            <div className="flex flex-col gap-0">
              {conversations.data
                ?.toSorted(
                  (a, b) =>
                    (b.last_unread?.timestamp ?? 0) -
                    (a.last_unread?.timestamp ?? 0)
                )
                .map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    latestIsYou={
                      conversation.last_unread?.sender_id === profile.data?.id
                    }
                    latestMessage={conversation.last_unread?.message}
                    conversation={conversation}
                    setConversationId={setConversationId}
                  />
                ))}
            </div>
          </div>
          {/* Conversation Pane */}
          {conversation?.loading ?? true ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader>Loading conversation...</Loader>
            </div>
          ) : (
            <div className="flex flex-col justify-end flex-1 max-w-[75%] max-h-[100%]">
              <ConversationPane
                conversation={conversation}
                chatAnchorRef={chatAnchorRef}
              />
              {conversationId ? (
                <div className="flex flex-col p-2 gap-3">
                  <Textarea
                    placeholder="Send a message here..."
                    className="w-full h-20 p-3 border-gray-200 rounded-[0.33em] focus:ring-0 focus:ring-transparent resize-none text-sm overflow-y-auto"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleMessage(conversation.senderId, message);
                      }
                    }}
                    maxLength={1000}
                  />
                  <Button
                    size="md"
                    disabled={sending || !message.trim()}
                    onClick={() =>
                      conversation.senderId &&
                      handleMessage(conversation.senderId, message)
                    }
                  >
                    {sending ? "Sending..." : "Send Message"}
                    <SendHorizonal className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="h-[100%] flex flex-col items-center pt-[25%]">
                  <Card className="flex flex-col items-start mx-auto max-w-prose">
                    <div className="font-bold mb-1">
                      Welcome to your conversations!
                    </div>
                    <div className="text-xs opacity-70">
                      Click on a conversation to start chatting.
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full flex items-center animate-fade-in h-full">
          <div className="flex flex-col items-center h-fit w-1/3 mx-auto pb-32">
            <div className="opacity-35 mb-10">
              <div className="flex flex-row justify-center w-full">
                <h1
                  className={cn(
                    "block font-heading font-bold",
                    isMobile ? "text-5xl" : "text-6xl"
                  )}
                >
                  BetterInternship
                </h1>
              </div>
              <br />
              <div className="flex flex-row justify-center w-full">
                <p className="block text-2xl tracking-tight">
                  Better Internships Start Here
                </p>
              </div>
            </div>
            <div
              className={cn(
                "text-center border border-primary border-opacity-50 text-primary shadow-sm rounded-[0.33em] opacity-85 p-4 bg-white",
                isMobile ? "min-w-full" : "min-w-prose"
              )}
            >
              You currently don't have any conversations.
            </div>
          </div>
        </div>
      )}
      <hr />
      <br />
    </div>
  );
}

// ! change type to conversation
const ConversationPane = ({
  conversation,
  chatAnchorRef,
}: {
  conversation: any;
  chatAnchorRef: Ref<HTMLDivElement>;
}) => {
  const profile = useProfile();
  const { employerName } = useEmployerName(conversation.senderId);
  let lastSelf = false;

  return (
    <div className="flex flex-col-reverse gap-1 p-2 max-h-[100%] overflow-auto">
      <div ref={chatAnchorRef} />
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
            them: employerName,
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
    </div>
  );
};

const ConversationCard = ({
  conversation,
  latestIsYou,
  latestMessage,
  setConversationId,
}: {
  // ! change to type conversation
  conversation: any;
  latestIsYou: boolean;
  latestMessage: string;
  setConversationId: (id: string) => void;
}) => {
  const profile = useProfile();
  const conversations = useConversations();
  const [employerId, setEmployerId] = useState("");
  const { employerName } = useEmployerName(employerId);

  // ! refactor
  useEffect(() => {
    setEmployerId(
      conversation?.subscribers?.find(
        (subscriberId: string) => subscriberId !== profile.data?.id
      ) ?? ""
    );
  }, [conversation]);

  return (
    <Card
      className="rounded-none border-l-0 border-r-0 border-b-0 last:border-b py-2 px-8 hover:bg-gray-100 hover:cursor-pointer"
      onMouseDown={() => setConversationId(conversation.id)}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-4">
          {employerId && <EmployerPfp employer_id={employerId} />}
          <div className="flex flex-col">
            <span className="font-medium flex flex-row items-center gap-2">
              {employerName}{" "}
              <Badge
                type="warning"
                className={cn(
                  conversations.unreads.some((unread) =>
                    unread.subscribers.includes(employerId)
                  )
                    ? "block"
                    : "hidden"
                )}
              >
                Unread
              </Badge>
            </span>
            <span className="text-xs opacity-60 line-clamp-1 max-w-prose text-ellipsis  ">
              {(latestIsYou ? "You: " : "") + latestMessage}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>
    </Card>
  );
};
