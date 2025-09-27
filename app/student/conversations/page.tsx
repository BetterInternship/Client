"use client";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useAuthContext } from "@/lib/ctx-auth";
import { Card } from "@/components/ui/card";
import { EmployerPfp } from "@/components/shared/pfp";
import { ChevronLeft, ChevronRight, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { Ref, useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/messages";
import { Button } from "@/components/ui/button";
import { UserConversationService } from "@/lib/api/services";
import { useProfile } from "@/lib/api/student.api";
import { Loader } from "@/components/ui/loader";
import { useEmployerName } from "@/hooks/use-employer-api";
import { Badge } from "@/components/ui/badge";

/**
 * Mobile behavior:
 * - List screen (default)
 * - Chat screen (full screen) with a sticky top bar + Back button
 * Desktop behavior:
 * - 2-column split (left list 25%, right chat 75%)
 */

export default function ConversationsPage() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfile();
  const conversations = useConversations();
  const { isMobile } = useAppContext();

  // selection + message composing state
  const [conversationId, setConversationId] = useState("");
  const conversation = useConversation("user", conversationId);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // mobile "router": list or chat
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // anchor for autoscroll
  const chatAnchorRef = useRef<HTMLDivElement>(null);

  redirectIfNotLoggedIn();

  // auto-switch to chat view on mobile when a conversation is selected
  useEffect(() => {
    if (isMobile && conversationId) setMobileView("chat");
  }, [isMobile, conversationId]);

  // unsubscribe on conversation change (keeps your original behavior)
  useEffect(() => {
    conversation.unsubscribe();
  }, [conversationId]);

  const sortedConvos = useMemo(
    () =>
      (conversations.data ?? []).toSorted(
        (a, b) => (b.last_unread?.timestamp ?? 0) - (a.last_unread?.timestamp ?? 0)
      ),
    [conversations.data]
  );

  const endSend = () => {
    setMessage("");
    setSending(false);
    chatAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMessage = async (employerId: string | undefined, msg: string) => {
    if (!msg.trim() || !employerId) return;
    setSending(true);

    const employerConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(employerId)
    );

    if (!employerConversation) return endSend();

    await UserConversationService.sendToEmployer(employerConversation.id, msg).catch(
      endSend
    );

    endSend();
  };

  // loading state for initial fetch
  if (conversations.loading) {
    return <Loader>Loading your conversations...</Loader>;
  }

  const hasConversations = (conversations.data?.length ?? 0) > 0;

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      {hasConversations ? (
        <>
          {/* ===== Left: List (Desktop always visible; Mobile only when in "list" view) ===== */}
          <aside
            className={cn(
              "border-r border-gray-200 md:min-w-[25%] md:max-w-[25%] md:block",
              // mobile: show only when in list mode
              "md:relative",
              isMobile ? (mobileView === "list" ? "block" : "hidden") : "block"
            )}
          >
            <div className="h-full max-h-full overflow-y-auto">
              <ConversationList
                conversations={sortedConvos}
                profileId={profile.data?.id}
                onPick={(id) => setConversationId(id)}
              />
            </div>
          </aside>

          {/* ===== Right: Chat (Desktop always visible; Mobile only when in "chat" view) ===== */}
          <section
            className={cn(
              "flex-1 flex flex-col md:max-w-[75%] max-h-full",
              isMobile ? (mobileView === "chat" ? "flex" : "hidden") : "flex"
            )}
          >
            {/* Mobile top bar */}
            {isMobile && (
              <div className="sticky top-0 z-10 px-3 py-2 border-b bg-white/90 backdrop-blur">
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
                    onClick={() => {
                      setMobileView("list");
                      // keep selection; just go back to list
                    }}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <ChatHeaderTitle conversationId={conversationId} />
                </div>
              </div>
            )}

            {/* Chat body */}
            {conversation?.loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader>Loading conversation...</Loader>
              </div>
            ) : conversationId ? (
              <>
                <ConversationPane conversation={conversation} chatAnchorRef={chatAnchorRef} />
                <ComposerBar
                  disabled={sending}
                  value={message}
                  onChange={setMessage}
                  onSend={() => handleMessage(conversation.senderId, message)}
                />
              </>
            ) : (
              <EmptyChatHint />
            )}
          </section>
        </>
      ) : (
        <NoConversationsEmptyState />
      )}
    </div>
  );
}

/* ======================= Subcomponents ======================= */

function ConversationList({
  conversations,
  profileId,
  onPick,
}: {
  conversations: any[];
  profileId?: string;
  onPick: (id: string) => void;
}) {
  const { unreads } = useConversations();

  return (
    <div className="flex flex-col">
      {conversations.map((c) => (
        <ConversationCard
          key={c.id}
          conversation={c}
          latestIsYou={c.last_unread?.sender_id === profileId}
          latestMessage={c.last_unread?.message}
          setConversationId={onPick}
          isUnread={
            !!unreads?.some((u) =>
              u.subscribers.some((s: string) => c.subscribers?.includes(s))
            )
          }
        />
      ))}
    </div>
  );
}

function ChatHeaderTitle({ conversationId }: { conversationId?: string }) {
  const { senderId } = useConversation("user", conversationId || "");
  const { employerName } = useEmployerName(senderId || "");
  return (
    <div className="min-w-0">
      <div className="font-medium truncate">{employerName || "Conversations"}</div>
      <div className="text-[11px] text-gray-500 -mt-[2px]">Chat</div>
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
        "sticky bottom-0 z-10 border-t bg-white",
        "px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2"
      )}
    >
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Send a message here..."
          className="w-full h-24 p-3 border-gray-200 rounded-[0.33em] focus:ring-0 focus:ring-transparent resize-none text-sm overflow-y-auto"
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
          <Button size="md" disabled={disabled || !value.trim()} onClick={onSend}>
            {disabled ? "Sending..." : "Send Message"}
            <SendHorizonal className="w-5 h-5" />
          </Button>
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
        <div className="text-xs opacity-70">Click on a conversation to start chatting.</div>
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
              isMobile ? "text-5xl" : "text-6xl"
            )}
          >
            BetterInternship
          </h1>
          <p className="mt-3 text-2xl tracking-tight">Better Internships Start Here</p>
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
  conversation: any;
  chatAnchorRef: Ref<HTMLDivElement>;
}) => {
  const profile = useProfile();
  const { employerName } = useEmployerName(conversation.senderId);
  let lastSelf = false;

  return (
    <div className="flex-1 flex flex-col-reverse gap-1 p-2 overflow-auto">
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
  isUnread,
}: {
  conversation: any; // consider replacing with a proper type
  latestIsYou: boolean;
  latestMessage: string;
  setConversationId: (id: string) => void;
  isUnread?: boolean;
}) => {
  const profile = useProfile();
  const [employerId, setEmployerId] = useState("");

  useEffect(() => {
    setEmployerId(
      conversation?.subscribers?.find(
        (subscriberId: string) => subscriberId !== profile.data?.id
      ) ?? ""
    );
  }, [conversation, profile.data?.id]);

  const { employerName } = useEmployerName(employerId);

  return (
    <Card
      className={cn(
        "rounded-none border-0 border-b border-gray-200 py-3 px-4 md:px-6 hover:bg-gray-50 cursor-pointer"
      )}
      onMouseDown={() => setConversationId(conversation.id)}
      onTouchStart={() => setConversationId(conversation.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {employerId && <EmployerPfp employer_id={employerId} />}
          <div className="flex flex-col min-w-0">
            <span className="font-medium flex items-center gap-2 truncate">
              {employerName ?? "Conversation"}
              <Badge type="warning" className={cn(isUnread ? "inline-flex" : "hidden")}>
                Unread
              </Badge>
            </span>
            <span className="text-xs text-gray-600 line-clamp-1">
              {(latestIsYou ? "You: " : "") + (latestMessage ?? "")}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50 shrink-0" />
      </div>
    </Card>
  );
};
