"use client";
import { useEffect } from "react";
import { usePocketbase } from "@/lib/pocketbase";
import { sendNotification, checkNotificationSupport } from "@/lib/notification-service";

export function NotificationListener() {
  const { user, pb } = usePocketbase();
  useEffect(() => {
    if (!user?.id) return;

    pb.collection("conversations").subscribe("*", (e) => {
      const newMessages = e.record.contents;
      const lastMessage = newMessages[newMessages.length - 1];

      if (lastMessage?.sender_id !== user.id) {
        console.log('Sending notification...');
        if (checkNotificationSupport()) {
          sendNotification('message', {
            body: lastMessage.message.substring(0, 100),
          });
        }
      }
    }, { expand: "subscribers" });

    return () => {
      pb.collection("conversations").unsubscribe("*")
    };
  }, [user?.id, pb]);

  return null;
}