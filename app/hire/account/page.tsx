"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ContentLayout from "@/components/features/hire/content-layout";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { useAuthContext } from "@/app/hire/authctx";
import { ProfileTab } from "@/components/features/hire/account/profile-tab";
import { NotificationsTab } from "@/components/features/hire/account/notifications-tab";
import { TeamTab } from "@/components/features/hire/account/team-tab";
import { CompanyTab } from "@/components/features/hire/account/company-tab";

// TabGroup is name-keyed (the name is both the button label and the
// identity), so the ?tab= query slug is mapped to/from the display label
// here rather than forking the shared component.
const TAB_LABELS = ["Profile", "Notifications", "Team", "Company"] as const;
type TabLabel = (typeof TAB_LABELS)[number];

const SLUG_TO_LABEL: Record<string, TabLabel> = {
  profile: "Profile",
  notifications: "Notifications",
  team: "Team",
  company: "Company",
};
const LABEL_TO_SLUG: Record<TabLabel, string> = {
  Profile: "profile",
  Notifications: "notifications",
  Team: "team",
  Company: "company",
};

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, redirectIfNotLoggedIn } = useAuthContext();
  const isAdmin = user?.role === "ADMIN";

  redirectIfNotLoggedIn();

  const requestedTab = SLUG_TO_LABEL[searchParams.get("tab") ?? ""] ?? "Profile";
  // A MEMBER deep-linking (or leftover bookmark) into an ADMIN-only tab
  // falls back to Profile — the API enforces this too; this is just the UI
  // reflecting it immediately instead of erroring on first fetch.
  const activeTab: TabLabel =
    !isAdmin && (requestedTab === "Team" || requestedTab === "Company")
      ? "Profile"
      : requestedTab;

  const setActiveTab = (label: string) => {
    const slug = LABEL_TO_SLUG[label as TabLabel] ?? "profile";
    router.replace(`/account?tab=${slug}`);
  };

  return (
    <ContentLayout>
      <div className="w-full max-w-[760px] py-4 space-y-4">
        <h1 className="text-2xl font-bold font-heading">Account</h1>
        <TabGroup value={activeTab} onValueChange={setActiveTab}>
          <Tab name="Profile">
            <ProfileTab />
          </Tab>
          <Tab name="Notifications">
            <NotificationsTab />
          </Tab>
          {isAdmin && (
            <Tab name="Team">
              <TeamTab />
            </Tab>
          )}
          {isAdmin && (
            <Tab name="Company">
              <CompanyTab />
            </Tab>
          )}
        </TabGroup>
      </div>
    </ContentLayout>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageContent />
    </Suspense>
  );
}
