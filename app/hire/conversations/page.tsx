"use client";

import { ConversationPage } from "@/components/features/hire/chat/ConversationPage";
import { useDbRefs } from "@/lib/db/use-refs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@/components/features/hire/content-layout";

function ConversationsPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId")
  const router = useRouter();

  return(
      <ContentLayout
      className="p-0"
      >
         <div className="w-full h-full">
          <ConversationPage 
          chatId={conversationId || undefined}
           />
        </div>
      </ContentLayout>
  )
};

export default function Conversations() {
  return(
    <Suspense>
      <ConversationsPage />
    </Suspense>
  );
}
