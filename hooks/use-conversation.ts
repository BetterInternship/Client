/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-07-11 17:06:17
 * @ Modified time: 2025-07-21 18:10:11
 * @ Description:
 *
 * Used by student users for managing conversation state.
 */

import { usePocketbase } from "@/lib/pocketbase";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    let unsubscribe = () => {};

    if (!user || !conversationId || !conversationId.trim().length) {
      setMessages([]);
      setSenderId("");
      return () => unsubscribe();
    }

    // Pull messages first
    pb.collection("conversations")
      .getOne(conversationId)
      .then((conversation) => {
        setSenderId(
          conversation.subscribers.find((id: string) => id !== user.id)
        );
        setMessages(conversation.contents);
      });

    // Subscribe to messages
    pb.collection("conversations")
      .subscribe(
        "*",
        function (e) {
          const conversation = e.record;
          setMessages(conversation.contents);
        },
        {
          filter: `id = '${conversationId}'`,
        }
      )
      .then((u) => (unsubscribe = u));

    return () => unsubscribe();
  }, [user, conversationId]);

  return {
    messages,
    senderId,
    loading,
  };
};

export const useConversations = (type: "user" | "employer") => {
  const { pb, user } = usePocketbase(type);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (!user) return () => unsubscribe();

    // Pull all convos first
    pb.collection("conversations")
      .getFullList({ filter: `subscribers ~ '${user.id}'` })
      .then((conversations) => {
        setConversations(conversations);
      });

    // Subscribe to notifications
    pb.collection("users")
      .subscribe(
        "*",
        function (e) {
          const subscriber = e.record;
          const conversations = Object.keys(subscriber.last_unreads).map(
            (id) => ({
              id,
              ...subscriber.last_unreads[id],
            })
          );
          setConversations(conversations);
        },
        {
          filter: `id = '${user.id}'`,
        }
      )
      .then((u) => (unsubscribe = u));

    return () => unsubscribe();
  }, [user]);

  return {
    data: conversations,
  };
};
