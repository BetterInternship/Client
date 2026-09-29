/**
 * Student-initiated "invite your university" compose link (plan discussed
 * 2026-09-29, Top pages' "Show companies with MOA" button). Mirrors
 * Partners-Client's lib/compose-url.ts (used there for university-invites-
 * company emails) but fire-and-forget: no draft persistence, no backend
 * record — the student picks a provider, we open a prefilled tab, they hit
 * send from their own mailbox.
 */

export type ComposeProvider = "gmail" | "outlook";

export const UNIVERSITY_INVITE_CC_EMAIL = "invites@betterinternship.com";

interface ComposeMailInput {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}

// Same param shapes as Partners-Client's buildComposeUrl: Gmail's `cc=` works
// directly, Outlook's deeplink compose endpoint doesn't reliably honor it so
// it's folded into `to` as a second, comma-separated recipient instead.
export function buildComposeUrl(
  provider: ComposeProvider,
  input: ComposeMailInput,
): string {
  const subject = encodeURIComponent(input.subject);
  const body = encodeURIComponent(input.body);

  if (provider === "gmail") {
    const to = encodeURIComponent(input.to);
    const cc = input.cc ? encodeURIComponent(input.cc) : null;
    const params = [
      "view=cm",
      "fs=1",
      `to=${to}`,
      cc ? `cc=${cc}` : null,
      `su=${subject}`,
      `body=${body}`,
    ].filter((p): p is string => p !== null);
    return `https://mail.google.com/mail/?${params.join("&")}`;
  }

  const to = encodeURIComponent(
    input.cc ? `${input.to},${input.cc}` : input.to,
  );
  const params = [`to=${to}`, `subject=${subject}`, `body=${body}`];
  return `https://outlook.office.com/mail/deeplink/compose?${params.join("&")}`;
}

export function buildUniversityInviteSubject(universityName: string): string {
  return `${universityName} — internship partnership opportunity`;
}

export function buildUniversityInviteBody(universityName: string): string {
  return [
    "Hello,",
    `I'm a student using BetterInternship (betterinternship.com) to look for internships, and I'd love for ${universityName} to offer credited internships to students through the platform.`,
    "Universities can get started here:\nhttps://uni.betterinternship.com",
    "Thank you!",
  ].join("\n\n");
}
