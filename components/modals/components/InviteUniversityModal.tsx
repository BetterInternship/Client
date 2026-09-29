"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@betterinternship/components";
import { FormInput } from "@/components/EditForm";
import {
  buildComposeUrl,
  buildUniversityInviteBody,
  buildUniversityInviteSubject,
  UNIVERSITY_INVITE_CC_EMAIL,
  type ComposeProvider,
} from "@/lib/utils/university-invite-compose";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROVIDER_LABEL: Record<ComposeProvider, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
};

interface InviteUniversityModalProps {
  universityName: string;
}

/**
 * Fire-and-forget invite (plan discussed 2026-09-29): no backend record, just
 * a prefilled compose tab the student sends from their own mailbox. The
 * split button + provider dropdown matches Partners-Client's manual invite
 * send exactly (components/invites/company-invite-form.tsx) — only the
 * remembered-draft/provider persistence is dropped, since that only pays off
 * for someone sending many invites, not a one-off from a student.
 */
export function InviteUniversityModal({
  universityName,
}: InviteUniversityModalProps) {
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<ComposeProvider>("gmail");
  const isValidEmail = EMAIL_PATTERN.test(email);

  const handleSend = () => {
    if (!isValidEmail) return;
    const url = buildComposeUrl(provider, {
      to: email,
      cc: UNIVERSITY_INVITE_CC_EMAIL,
      subject: buildUniversityInviteSubject(universityName),
      body: buildUniversityInviteBody(),
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

      <div className="flex w-full">
        <Button
          type="button"
          className="flex-1 rounded-r-none"
          disabled={!isValidEmail}
          onClick={handleSend}
        >
          {`Invite with ${PROVIDER_LABEL[provider]}`}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="rounded-l-none border-l border-white/25 px-3"
              aria-label="Choose email provider"
            >
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setProvider("gmail")}
            >
              Gmail
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setProvider("outlook")}
            >
              Outlook
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
