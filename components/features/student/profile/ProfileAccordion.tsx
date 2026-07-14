"use client";

import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  FileText,
  MessageCircle,
  UserRound,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PublicUser } from "@/lib/db/db.types";
import { InternshipDetailsSection } from "./InternshipDetailsSection";
import { PersonalInformationSection } from "./PersonalInformationSection";
import { ResumeSection } from "./ResumeSection";
import type { ProfileResumeManager, ProfileSectionKey } from "./profile-types";
import { ConnectedAccountsSection } from "./ConnectedAccountsSection";

export function ProfileAccordion({
  profile,
  resumeManager,
  openSections,
  onOpenSectionsChange,
}: {
  profile: PublicUser;
  resumeManager: ProfileResumeManager;
  openSections: ProfileSectionKey[];
  onOpenSectionsChange: (sections: ProfileSectionKey[]) => void;
}) {
  return (
    <Accordion
      type="multiple"
      value={openSections}
      onValueChange={(value) =>
        onOpenSectionsChange(value as ProfileSectionKey[])
      }
      className="overflow-hidden rounded-[0.33em] border border-blue-100 bg-white shadow-sm"
    >
      <ProfileAccordionItem
        value="resume"
        icon={<FileText className="h-5 w-5" />}
        title="Resume"
      >
        <ResumeSection manager={resumeManager} />
      </ProfileAccordionItem>

      <ProfileAccordionItem
        value="internship"
        icon={<BriefcaseBusiness className="h-5 w-5" />}
        title="Internship Details"
      >
        <InternshipDetailsSection profile={profile} />
      </ProfileAccordionItem>

      <ProfileAccordionItem
        value="personal"
        icon={<UserRound className="h-5 w-5" />}
        title="Personal Information"
      >
        <PersonalInformationSection profile={profile} />
      </ProfileAccordionItem>

      <ProfileAccordionItem
        value="connected-accounts"
        icon={<MessageCircle className="h-5 w-5" />}
        title="Connected Accounts"
      >
        <ConnectedAccountsSection />
      </ProfileAccordionItem>
    </Accordion>
  );
}

function ProfileAccordionItem({
  value,
  icon,
  title,
  children,
}: {
  value: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-blue-100">
      <AccordionTrigger className="px-4 py-4 text-[#061858] hover:no-underline sm:px-5">
        <span className="flex items-center gap-3 text-base font-semibold">
          <span className="text-primary">{icon}</span>
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-5 sm:px-5">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
