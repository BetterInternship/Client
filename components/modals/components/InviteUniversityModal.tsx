"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@betterinternship/components";
import { FormInput } from "@/components/EditForm";
import {
  buildComposeUrl,
  buildUniversityInviteBody,
  buildUniversityInviteSubject,
  UNIVERSITY_INVITE_CC_EMAIL,
  type ComposeProvider,
} from "@/lib/utils/university-invite-compose";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteUniversityModalProps {
  universityName: string;
}

/**
 * Fire-and-forget invite (plan discussed 2026-09-29): no backend record, just
 * a prefilled compose tab the student sends from their own mailbox — same
 * idea as Partners-Client's manual invite send, minus the draft/provider
 * persistence that only pays off for repeat senders.
 */
export function InviteUniversityModal({
  universityName,
}: InviteUniversityModalProps) {
  const [email, setEmail] = useState("");
  const isValidEmail = EMAIL_PATTERN.test(email);

  const openCompose = (provider: ComposeProvider) => {
    if (!isValidEmail) return;
    const url = buildComposeUrl(provider, {
      to: email,
      cc: UNIVERSITY_INVITE_CC_EMAIL,
      subject: buildUniversityInviteSubject(universityName),
      body: buildUniversityInviteBody(universityName),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="text-sm text-muted-foreground">
        If you want to find{" "}
        <b>companies that have MOAs with {universityName}</b>, help us by
        inviting them to BetterInternship.
      </p>

      <FormInput
        label="University contact email"
        type="email"
        required={false}
        placeholder="careers@uni.edu.ph"
        value={email}
        setter={setEmail}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          className="flex-1"
          disabled={!isValidEmail}
          onClick={() => openCompose("gmail")}
        >
          <Mail /> Open in Gmail
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={!isValidEmail}
          onClick={() => openCompose("outlook")}
        >
          <Send /> Open in Outlook
        </Button>
      </div>
    </div>
  );
}
