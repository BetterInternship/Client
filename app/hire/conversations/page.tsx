"use client";

import { ConversationPage } from "@/components/features/hire/chat/ConversationPage";
import { useDbRefs } from "@/lib/db/use-refs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@/components/features/hire/content-layout";

function ConversationsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();

  useEffect(() => {
      if (userId) {
        router.replace("/conversations");
      }
    }, [userId, router]);

  return(
      <ContentLayout
      className="p-0 max-h-[calc(100vh-7rem)] overflow-hidden"
      >
        <ConversationPage applicantId={userId || undefined} />
      </ContentLayout>
  )
};

export default function Conversations() {
  return(
    <Suspense>
      <ConversationPage />
    </Suspense>
  );
}
