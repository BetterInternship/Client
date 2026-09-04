"use client";

import { ArrowUpRight, CheckCircle2, Handshake } from "lucide-react";
import { Badge, Button } from "@betterinternship/components";
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
            <span>
              Build internship partnerships and manage MOAs with universities on
              the <b className="font-medium">Partners Portal</b>.
            </span>
            {linked && (
              <Badge variant="solid" type="supportive" className="gap-1">
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                Linked
              </Badge>
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
            className="w-full shrink-0 bg-transparent transition-all sm:bg-background sm:group-hover/status-notice:w-fit"
          >
            <ArrowUpRight aria-hidden="true" />
            <span className="button-label whitespace-nowrap">
              Partners Portal
            </span>
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
        className="group/status-notice mb-6 cursor-pointer border-gray-200 bg-gray-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
    </>
  );
}
