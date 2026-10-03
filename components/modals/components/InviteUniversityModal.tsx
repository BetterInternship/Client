"use client";

import { useState } from "react";
import Image from "next/image";
import invitationArtwork from "@/public/top/university-invite.webp";
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
  onInviteSent?: () => void;
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
  onInviteSent,
}: InviteUniversityModalProps) {
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<ComposeProvider>("gmail");
  const [composeOpened, setComposeOpened] = useState(false);
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
    setComposeOpened(true);
  };

  return (
    <div className="flex flex-col gap-5 pb-1">
      <div className="text-left">
        <Image
          src={invitationArtwork}
          alt=""
          className="mx-auto mb-4 h-auto w-[144px] sm:w-[176px]"
          sizes="(min-width: 640px) 176px, 144px"
          loading="eager"
        />

        <p className="mt-3 text-justify text-sm leading-6 text-muted-foreground">
          Invite{" "}
          <strong className="font-medium text-gray-900">
            {universityName}
          </strong>{" "}
          to BetterInternship. We&apos;ll be copied into your email so we can
          help connect your university with partner companies.
        </p>
      </div>

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
          className="min-h-11 flex-1 rounded-r-none"
          disabled={!isValidEmail}
          onClick={handleSend}
        >
          {`Invite with ${PROVIDER_LABEL[provider]}`}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="min-h-11 rounded-l-none border-l border-white/25 px-3"
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
      {onInviteSent && composeOpened && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Send the invitation in {PROVIDER_LABEL[provider]}, then come back
            here to continue. We can&apos;t confirm delivery from your email
            app.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onInviteSent}
            className="min-h-11 w-full"
          >
            I&apos;ve sent it — continue
          </Button>
        </div>
      )}
    </div>
  );
}
