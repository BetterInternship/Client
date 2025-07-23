/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-07-11 17:06:17
 * @ Modified time: 2025-07-23 14:39:02
 * @ Description:
 *
 * Used by student users for managing conversation state.
 */

import { APIClient, APIRoute } from "@/lib/api/api-client";
import { usePocketbase } from "@/lib/pocketbase";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const { pb, user } = usePocketbase(type);
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
      });

    // Subscribe to messages
    pb.collection("conversations")
      .subscribe(
        "*",
        async (e) => {
          const conversation = e.record;
          setMessages(conversation.contents);
          await seenConversation();
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

export const useConversations = (type: "user" | "employer") => {
  const { pb, user } = usePocketbase(type);
  const [conversations, setConversations] = useState<any[]>([]);
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
          })
        );
        setConversations(conversations);
        setLoading(false);
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
            })
          );
          setConversations(conversations);
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

  return {
    data: conversations,
    loading,
  };
};
