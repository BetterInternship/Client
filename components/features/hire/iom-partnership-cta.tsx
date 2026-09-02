"use client";

import { CheckCircle2, Handshake } from "lucide-react";
import { Button } from "@betterinternship/components";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { useModalRegistry } from "@/components/modals/modal-registry";
import type { Employer } from "@/lib/db/db.types";

function getIomCompanyUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.startsWith("dev.")) return "https://dev.moa.betterinternship.com";
    if (host.endsWith(".betterinternship.com"))
      return "https://moa.betterinternship.com";
  }
  return "http://moa.localhost:4100";
}

export function IomPartnershipCta({
  profile,
  recruiterEmail,
}: {
  profile: Employer;
  recruiterEmail: string | null | undefined;
}) {
  const linked = !!profile.iom_company_id;
  const modalRegistry = useModalRegistry();

  const activate = () => {
    if (linked) openIomLogin();
    else openSetup();
  };

  const openIomLogin = () => {
    const url = new URL("/login", getIomCompanyUrl());
    const accountEmail = profile.iom_account_email || recruiterEmail;
    if (accountEmail) url.searchParams.set("email", accountEmail);
    url.searchParams.set("linked_account", "1");
    if (profile.iom_account_email) {
      url.searchParams.set("managed_account", profile.iom_account_email);
    }
    if (profile.name) url.searchParams.set("company_name", profile.name);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const openSetup = () => {
    modalRegistry.iomPartnership.open();
  };

  return (
    <>
      <StatusNotice
        icon={Handshake}
        title="Partner with universities through MOAs"
        description={
          <div className="flex items-center gap-2">
            Build internship partnerships and manage MOAs with universities.
            {linked && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-supportive px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-supportive-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Linked
              </span>
            )}
          </div>
        }
        action={
          <Button
            variant="outline"
            scheme="primary"
            expandIcon
            onClick={(event) => {
              event.stopPropagation();
              activate();
            }}
            className="w-full bg-transparent transition-[width] sm:w-52 sm:shrink-0 sm:bg-background sm:group-hover/status-notice:w-64"
          >
            <Handshake aria-hidden="true" />
            <span className="button-label">Partner with Universities</span>
          </Button>
        }
        role="button"
        tabIndex={0}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
        className="mb-6 cursor-pointer border-gray-200 bg-gray-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
    </>
  );
}
