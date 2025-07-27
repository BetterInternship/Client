/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-07-11 17:06:17
 * @ Modified time: 2025-07-27 12:33:05
 * @ Description:
 *
 * Used by student users for managing conversation state.
 */

"use client";

import { APIClient, APIRoute } from "@/lib/api/api-client";
import { usePocketbase } from "@/lib/pocketbase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Message {
  sender_id: string;
  message: string;
  timestamp: string;
}

/**
 * Allows to manage conversation state.
 *
 * @hook
 * @param conversationId
 */
export const useConversation = (
  type: "employer" | "user",
  conversationId?: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderId, setSenderId] = useState("");
  const [loading, setLoading] = useState(true);
  const { pb, user, refresh } = usePocketbase();
  const [unsubscribe, setUnsubscribe] = useState<Function>(() => () => {});

  const seenConversation = useCallback(async () => {
    if (!conversationId) return;
    const route =
      type === "employer"
        ? APIRoute("conversations").r("read", "hire", conversationId).build()
        : APIRoute("conversations").r("read", conversationId).build();
    await APIClient.post(route);
  }, [conversationId]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!user || !conversationId || !conversationId.trim().length) {
      setMessages([]);
      setSenderId("");
      return () => unsubscribe();
    }

    // Pull messages first
    pb.collection("conversations")
      .getOne(conversationId)
      .then(async (conversation) => {
        setSenderId(
          conversation.subscribers.find((id: string) => id !== user.id)
        );
        setMessages(conversation.contents);
        await seenConversation();
        setLoading(false);
      });

    // Subscribe to messages
    pb.collection("conversations")
      .subscribe(
        "*",
        async (e) => {
          const conversation = e.record;
          setMessages(conversation.contents);
          await seenConversation();
          setLoading(false);
        },
        {
          filter: `id = '${conversationId}'`,
        }
      )
      .then((u) => setUnsubscribe(() => u));

    return () => unsubscribe();
  }, [user, conversationId]);

  return {
    messages,
    senderId,
    loading,
    unsubscribe,
  };
};

/**
 * Create a new context. We use contexts so we dont have to keep sub/unsubbing to pocketbase.
 */
interface IConversationsContext {
  data: any[];
  unreads: any[];
  loading: boolean;
}
const ConversationsContext = createContext<IConversationsContext>(
  {} as IConversationsContext
);
export const ConversationsContextProvider = ({
  type,
  children,
}: {
  type: "user" | "employer";
  children: React.ReactNode;
}) => {
  const { pb, user, refresh } = usePocketbase();
  // ! change to Conversation type later on
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    if (!user) return () => unsubscribe();

    // Pull all convos first
    pb.collection("users")
      .getOne(user.id, {
        expand: "conversations",
        fields: "*,expand.conversations.id,expand.conversations.subscribers",
      })
      .then((subscriber) => {
        const conversations = subscriber.expand?.conversations?.map(
          (conversation: any) => ({
            ...conversation,
            last_unread: subscriber.last_unreads[conversation.id],
            last_read: subscriber.last_reads[conversation.id],
          })
        );
        const unreads =
          conversations?.filter(
            (conversation: any) =>
              conversation?.last_unread?.timestamp !==
              conversation?.last_read?.timestamp
          ) ?? [];

        setConversations(conversations);
        setUnreadConversations(unreads);
        setLoading(false);
      })
      .catch(async (e) => {
        console.log(e);
        await refresh();
      });

    // Subscribe to notifications
    pb.collection("users")
      .subscribe(
        "*",
        function (e) {
          const subscriber = e.record;
          const conversations = subscriber.expand?.conversations?.map(
            (conversation: any) => ({
              ...conversation,
              last_unread: subscriber.last_unreads[conversation.id],
              last_read: subscriber.last_reads[conversation.id],
            })
          );
          const unreads = conversations.filter(
            (conversation: any) =>
              conversation?.last_unread?.timestamp !==
              conversation?.last_read?.timestamp
          );

          setConversations(conversations);
          setUnreadConversations(unreads);
          setLoading(false);
        },
        {
          filter: `id = '${user.id}'`,
          expand: "conversations",
          fields: "*,expand.conversations.id,expand.conversations.subscribers",
        }
      )
      .then((u) => (unsubscribe = u));

    return () => unsubscribe();
  }, [user]);

  const conversationsContext = {
    data: conversations,
    unreads: unreadConversations,
    loading,
  };

  return (
    <ConversationsContext.Provider value={conversationsContext}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = () => {
  return useContext(ConversationsContext);
};
