"use client";

import type { ReactNode } from "react";
import { Globe2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatMonth } from "@/lib/utils";
import { displayValue } from "./profile-display-utils";

export function PersonalInformationSection({
  profile,
}: {
  profile: PublicUser;
}) {
  const { to_university_name } = useDbRefs();

  return (
    <div className="space-y-5">
      <InfoGroup title="Identity">
        <InfoRow label="First Name" value={profile.first_name} />
        <InfoRow label="Last Name" value={profile.last_name} />
        <InfoRow label="Phone Number" value={profile.phone_number} />
      </InfoGroup>

      <InfoGroup title="Education">
        <InfoRow
          label="University"
          value={
            profile.university
              ? to_university_name(profile.university)
              : "\u2014"
          }
        />
        <InfoRow label="Degree / Program" value={profile.degree} />
        <InfoRow
          label="Expected Graduation Date"
          value={formatMonth(profile.expected_graduation_date) ?? "\u2014"}
        />
      </InfoGroup>

      <InfoGroup title="External Profiles">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <ProfileLinkButton
            title="Portfolio"
            icon={<Globe2 className="h-4 w-4" />}
            link={profile.portfolio_link}
          />
          <ProfileLinkButton title="GitHub" link={profile.github_link} />
          <ProfileLinkButton title="LinkedIn" link={profile.linkedin_link} />
        </div>
      </InfoGroup>
    </div>
  );
}

function InfoGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-base font-semibold text-[#061858]">{title}</h3>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-[#061858]">
        {displayValue(value)}
      </dd>
    </div>
  );
}

function ProfileLinkButton({
  title,
  link,
  icon,
}: {
  title: string;
  link?: string | null;
  icon?: ReactNode;
}) {
  const enabled = !!link;

  return (
    <Button
      type="button"
      variant="outline"
      className="justify-start text-xs"
      disabled={!enabled}
      onClick={
        enabled
          ? () => window.open(link, "_blank", "noopener,noreferrer")
          : undefined
      }
    >
      {icon}
      {title}
    </Button>
  );
}
