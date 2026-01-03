"use client";
import { useEffect } from "react";
import { usePocketbase } from "@/lib/pocketbase";
import { sendNotification, checkNotificationSupport } from "@/lib/notification-service";

export function NotificationListener() {
  const { user, pb } = usePocketbase();
  useEffect(() => {
    if (!user?.id) return;

    pb.collection("conversations").subscribe("*", (e) => {
      const convoId = e.record.id;
      const newMessages = e.record.contents;
      const lastMessage = newMessages[newMessages.length - 1];

      if (lastMessage?.sender_id !== user.id) {
        if (checkNotificationSupport()) {
          const n = sendNotification(`New message - BetterInternship`, {
            body: lastMessage.message.substring(0, 100),
            tag: lastMessage.sender_id,
          });

          if (n) {
            n.onclick = () => {
              window.focus();
              const target = `/conversations?userId=${lastMessage.sender_id}`;

              if (window.location.pathname + window.location.search !== target) {
                window.location.href = target;
              }
            }
          }
        }
      }
    }, { expand: "subscribers" });

    return () => {
      pb.collection("conversations").unsubscribe("*")
    };
  }, [user?.id, pb]);

  return null;
}