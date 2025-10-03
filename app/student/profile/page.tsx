"use client";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { Edit2, Upload, Eye, Camera, CheckCircle2, Globe2 } from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { useAuthContext } from "../../../lib/ctx-auth";
import { useModal } from "@/hooks/use-modal";
import { useDbRefs } from "@/lib/db/use-refs";
import { PublicUser } from "@/lib/db/db.types";
import { ErrorLabel, LabeledProperty } from "@/components/ui/labels";
import { UserService } from "@/lib/api/services";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { Button } from "@/components/ui/button";
import { FileUploadInput, useFile, useFileUpload } from "@/hooks/use-file";
import { Card } from "@/components/ui/card";
import { getFullName } from "@/lib/profile";
import { toURL, openURL } from "@/lib/utils/url-utils";
import {
  isValidOptionalGitHubURL,
  isValidOptionalLinkedinURL,
  isValidOptionalURL,
} from "@/lib/utils/url-utils";
import { Loader } from "@/components/ui/loader";
import { BoolBadge } from "@/components/ui/badge";
import { cn, formatMonth, isValidPHNumber, toSafeString } from "@/lib/utils";
import { MyUserPfp } from "@/components/shared/pfp";
import { useAppContext } from "@/lib/ctx-app";
import {
  createEditForm,
  FormMonthPicker,
  FormInput,
} from "@/components/EditForm";
import { Divider } from "@/components/ui/divider";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Autocomplete, AutocompleteMulti } from "@/components/ui/autocomplete";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import { POSITION_TREE } from "@/lib/consts/positions";
import { OutsideTabs, OutsideTabPanel } from "@/components/ui/outside-tabs";
import {
  SingleChipSelect,
  type Option as ChipOpt,
} from "@/components/ui/chip-select";
import { Badge } from "@/components/ui/badge";
import { AutoApplyCard } from "@/components/features/student/profile/AutoApplyCard";
import { useProfileActions } from "@/lib/api/student.actions.api";

const [ProfileEditForm, useProfileEditForm] = createEditForm<PublicUser>();

export default function ProfilePage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfileData();
  const profileActions = useProfileActions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoApplySaving, setAutoApplySaving] = useState(false);
  const [autoApplyError, setAutoApplyError] = useState<string | null>(null);

  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: UserService.getMyResumeURL,
    route: "/users/me/resume",
  });

  // Modals
  const {
    open: openEmployerModal,
    close: closeEmployerModal,
    Modal: EmployerModal,
  } = useModal("employer-modal");

  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");

  const profileEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  redirectIfNotLoggedIn();

  const {
    fileInputRef: pfpFileInputRef,
    upload: pfpUpload,
    isUploading: pfpIsUploading,
  } = useFileUpload({
    uploader: UserService.updateMyPfp,
    filename: "pfp",
  });

  const data = profile.data as PublicUser | undefined;
  const { score, parts, tips } = computeProfileScore(data);

  useEffect(() => {
    if (searchParams.get("edit") === "true") setIsEditing(true);
  }, [searchParams]);

  useEffect(() => {
    if (data?.resume) {
      syncResumeURL();
    }
  }, [data?.resume, syncResumeURL]);

  if (profile.isPending) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader>Loading profile…</Loader>
      </div>
    );
  }

  if (profile.error) {
    return (
      <Card className="flex flex-col items-center justify-center max-w-md m-auto p-6 gap-4">
        <p className="text-red-600 text-base sm:text-lg text-center">
          Failed to load profile: {profile.error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  useEffect(() => {
    if (data?.resume) {
      syncResumeURL();
    }
  }, [data?.resume, syncResumeURL]);

  const openEmployerWithResume = async () => {
    await syncResumeURL();
    openEmployerModal();
  };

  const handleAutoApplySave = async () => {
    setAutoApplySaving(true);
    setAutoApplyError(null);

    const prev = !!profile.data?.apply_for_me;

    try {
      await profileActions.update.mutateAsync({ apply_for_me: !prev });
    } catch (e: any) {
      setAutoApplyError(e?.message ?? "Failed to update auto-apply");
    } finally {
      setAutoApplySaving(false);
    }
  };

  return (
    data && (
      <div className="min-h-screen mx-auto max-w-6xl">
        {/* Top header */}
        <div className="relative">
          <header className="relative px-4 sm:px-6 pt-10 ">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* PFP */}
              <div className="relative">
                <MyUserPfp size="36" />

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-0.5 -right-0.5 h-10 w-10 rounded-full"
                  onClick={() => pfpFileInputRef.current?.open()}
                  disabled={pfpIsUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <FileUploadInput
                  ref={pfpFileInputRef}
                  allowedTypes={["image/jpeg", "image/png", "image/webp"]}
                  maxSize={1}
                  onSelect={(file) => (
                    pfpUpload(file),
                    queryClient.invalidateQueries({ queryKey: ["my-profile"] })
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1 w-full min-w-0">
                <div className="flex items-center gap-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-3xl sm:text-4xl font-bold tracking-tight"
                  >
                    {getFullName(data)}
                  </motion.h1>
                </div>

                <div className="text-muted-foreground leading-snug mt-2">
                  <HeaderLine profile={data} />
                </div>

                {saveError && (
                  <p className="text-xs text-amber-600 mt-2">{saveError}</p>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* Main content */}
        <main className="px-4 sm:px-6 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Resume */}
            <Card className="p-5">
              <div className="font-medium">Resume/CV</div>

              <ResumeBox
                profile={data}
                openResumeModal={openEmployerWithResume}
              />
            </Card>

            {/* Profile */}
            {!isEditing && (
              <>
                <ProfileReadOnlyTabs
                  profile={data}
                  onEdit={() => setIsEditing(true)}
                />
              </>
            )}
            {isEditing && (
              <ProfileEditForm data={data}>
                <ProfileEditor
                  updateProfile={profileActions.update.mutateAsync}
                  ref={profileEditorRef}
                  rightSlot={
                    <Button
                      className="text-xs"
                      onClick={async () => {
                        setSaving(true);
                        setSaveError(null);
                        const success = await profileEditorRef.current?.save();
                        setSaving(false);
                        if (success) setIsEditing(false);
                        else
                          setSaveError(
                            "Please fix the errors in the form before saving." // TODO: Make this a toast
                          );
                      }}
                      disabled={saving}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  }
                />
              </ProfileEditForm>
            )}
          </div>

          {/* Right column */}
          <aside className="lg:col-span-1 space-y-6">
            <AutoApplyCard
              initialEnabled={!!data?.apply_for_me}
              onSave={handleAutoApplySave}
              saving={autoApplySaving}
              error={autoApplyError}
            />

            {/* Completion meter */}
            <div className="">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Profile completeness</span>
                <span>{score}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(parts).map(([k, ok]) => (
                  <span
                    key={k}
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border",
                      ok
                        ? "border-emerald-500/40 text-emerald-600"
                        : "border-amber-500/40 text-amber-700"
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 mr-1",
                        ok ? "opacity-100" : "opacity-50"
                      )}
                    />{" "}
                    {k}
                  </span>
                ))}
              </div>
              {/* NEW: quick tips, only show top 2 so it stays compact */}
              {tips.length > 0 && (
                <ul className="mt-3 text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {tips.slice(0, 2).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </main>

        <EmployerModal className="max-w-[80vw]">
          <ApplicantModalContent
            applicant={data}
            pfp_fetcher={() => UserService.getUserPfpURL("me")}
            pfp_route="/users/me/pic"
            open_resume={async () => {
              closeEmployerModal();
              await syncResumeURL();
              openResumeModal();
            }}
            open_calendar={async () => {
              openURL(data?.calendar_link);
            }}
            resume_url={resumeURL}
          />
        </EmployerModal>
      </div>
    )
  );
}

function HeaderLine({ profile }: { profile: PublicUser }) {
  const { to_university_name } = useDbRefs();

  const degree = profile.degree ?? null;
  const uni = profile.university
    ? to_university_name(profile.university)
    : null;
  const expectedGraduationDate = profile.expected_graduation_date ?? null;

  const chips: string[] = [];
  if (profile.expected_start_date || profile.expected_end_date) {
    const start = profile.expected_start_date ?? "—";
    const end = profile.expected_end_date ?? "—";
    chips.push(`Availability: ${start} → ${end}`);
  }
  if (profile.job_mode_ids?.length)
    chips.push(`Modes: ${profile.job_mode_ids.length}`);
  if (profile.job_type_ids?.length)
    chips.push(`Types: ${profile.job_type_ids.length}`);
  if (profile.job_category_ids?.length)
    chips.push(`Roles: ${profile.job_category_ids.length}`);

  return (
    <div className="flex flex-col gap-1">
      {(degree || expectedGraduationDate || uni) && (
        <div className="flex gap-2">
          <div className="py-1 px-2 rounded-[0.33em] border border-gray-300 bg-white flex items-center gap-1 text-sm">
            {uni}
          </div>

          {degree && (
            <div className="py-1 px-2 rounded-[0.33em] border border-gray-300 bg-white flex items-center gap-1 text-sm">
              {degree}
            </div>
          )}

          {expectedGraduationDate && (
            <div className="py-1 px-2 rounded-[0.33em] border border-gray-300 bg-white flex items-center gap-1 text-sm">
              {formatMonth(expectedGraduationDate)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileReadOnlyTabs({
  profile,
  onEdit,
}: {
  profile: PublicUser;
  onEdit: () => void;
}) {
  const { to_university_name, job_modes, job_types, job_categories } =
    useDbRefs();

  type TabKey = "Student Profile" | "Internship Details";
  const [tab, setTab] = useState<TabKey>("Student Profile");

  const tabs = [
    { key: "Student Profile", label: "Student Profile" },
    { key: "Internship Details", label: "Internship Details" },
  ] as const;

  return (
    <OutsideTabs
      tabs={tabs as unknown as { key: string; label: string }[]}
      value={tab}
      onChange={(v) => setTab(v as TabKey)}
      rightSlot={
        <div>
          <Button variant="outline" onClick={onEdit} className="text-xs">
            <Edit2 className="h-3 w-3" /> Edit profile
          </Button>
        </div>
      }
    >
      {/* Student Profile */}
      <OutsideTabPanel when="Student Profile" activeKey={tab}>
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Identity
          </div>
          <div className="grid grid-cols-1 gap-5 mt-2 sm:grid sm:grid-cols-3 sm:gap-5 sm:mt-2">
            <LabeledProperty
              label="First Name"
              value={toSafeString(profile.first_name)}
            />
            <LabeledProperty
              label="Middle Name"
              value={toSafeString(profile.middle_name)}
            />
            <LabeledProperty
              label="Last Name"
              value={toSafeString(profile.last_name)}
            />
            <LabeledProperty
              label="Phone Number"
              value={toSafeString(profile.phone_number)}
            />
          </div>
        </section>

        <Divider />

        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Educational Background
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
            <LabeledProperty
              label="University"
              value={
                profile.university
                  ? to_university_name(profile.university)
                  : "—"
              }
            />
            <LabeledProperty label="Degree" value={profile.degree ?? "-"} />
            <LabeledProperty
              label="Expected Graduation Date"
              value={formatMonth(profile.expected_graduation_date) ?? "-"}
            />
          </div>
        </section>

        <Divider />

        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            External Profiles
          </div>
          <div className="flex gap-2 mt-2">
            <ProfileLinkBadge
              title="Portfolio"
              icon={<Globe2 />}
              link={profile.portfolio_link}
            />
            <ProfileLinkBadge
              title="GitHub"
              // icon={<GithubLogo />}
              link={profile.github_link}
            />
            <ProfileLinkBadge
              title="LinkedIn"
              // icon={<LinkedinLogo />}
              link={profile.linkedin_link}
            />
            {/* <ProfileLinkBadge
              title="Calendar"
              icon={<CalendarDays />}
              link={profile.calendar_link}
            /> */}
          </div>
        </section>

        <Divider />

        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Personal Bio
          </div>
          <p className="text-sm text-justify mt-2">
            {profile.bio?.trim()?.length ? profile.bio : "—"}
          </p>
        </section>
      </OutsideTabPanel>

      {/* Internship Details*/}
      <OutsideTabPanel when="Internship Details" activeKey={tab}>
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Internship Details
          </div>
          {/*  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
            <LabeledProperty
              label="Type of internship"
              value={
                profile.internship_preferences?.internship_type
                  ? profile.internship_preferences.internship_type ===
                    "credited"
                    ? "Credited"
                    : "Voluntary"
                  : profile.taking_for_credit != null
                  ? profile.taking_for_credit
                    ? "Credited"
                    : "Voluntary"
                  : "—"
              }
            />
            {/* TODO: Remove this when we removed the columns */}
            <LabeledProperty
              label="Ideal internship start"
              value={
                toYYYYMM(
                  profile.internship_preferences?.expected_start_date ??
                    profile.expected_start_date
                ) ?? "—"
              }
            />
            {/* TODO: Remove this when we removed the columns */}
            {(profile.internship_preferences?.internship_type
              ? profile.internship_preferences.internship_type === "credited"
              : profile.taking_for_credit === true) && (
              <LabeledProperty
                label="Expected Duration (hours)"
                value={
                  typeof profile.expected_duration_hours === "number"
                    ? String(profile.expected_duration_hours)
                    : typeof profile.internship_preferences
                        ?.expected_duration_hours === "number"
                    ? String(
                        profile.internship_preferences.expected_duration_hours
                      )
                    : "—"
                }
              />
            )}
          </div>
        </section>

        <Divider />

        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Preferences
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
            {/* TODO: Remove this when we removed the columns */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Work Modes
              </div>
              {(() => {
                const ids = (profile.internship_preferences?.job_setup_ids ??
                  profile.job_mode_ids ??
                  []) as (string | number)[];
                const items = ids
                  .map((id) => {
                    const m = job_modes.find(
                      (x) => String(x.id) === String(id)
                    );
                    return m ? { id: String(m.id), name: m.name } : null;
                  })
                  .filter(Boolean) as { id: string; name: string }[];

                return items.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <Badge key={it.id}>{it.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                );
              })()}
            </div>

            {/* TODO: Remove this when we removed the columns */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Workload Types
              </div>
              {(() => {
                const ids = (profile.internship_preferences
                  ?.job_commitment_ids ??
                  profile.job_type_ids ??
                  []) as (string | number)[];
                const items = ids
                  .map((id) => {
                    const t = job_types.find(
                      (x) => String(x.id) === String(id)
                    );
                    return t ? { id: String(t.id), name: t.name } : null;
                  })
                  .filter(Boolean) as { id: string; name: string }[];

                return items.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <Badge key={it.id}>{it.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                );
              })()}
            </div>

            {/* TODO: Remove this when we removed the columns */}
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground mb-1">
                Positions / Categories
              </div>
              {(() => {
                const ids = (profile.internship_preferences?.job_category_ids ??
                  profile.job_category_ids ??
                  []) as string[];
                const items = ids
                  .map((id) => {
                    const c = job_categories.find((x) => x.id === id);
                    return c ? { id: c.id, name: c.name } : null;
                  })
                  .filter(Boolean) as { id: string; name: string }[];

                return items.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <Badge key={it.id}>{it.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                );
              })()}
            </div>
          </div>
        </section>
      </OutsideTabPanel>
    </OutsideTabs>
  );
}

const ProfileEditor = forwardRef<
  { save: () => Promise<boolean> },
  {
    updateProfile: (updatedProfile: Partial<PublicUser>) => void;
    rightSlot?: React.ReactNode;
  }
>(({ updateProfile, rightSlot }, ref) => {
  const qc = useQueryClient();
  const {
    formData,
    formErrors,
    setField,
    fieldSetter,
    addValidator,
    validateFormData,
    cleanFormData,
  } = useProfileEditForm();
  const { isMobile } = useAppContext();
  const {
    universities,
    colleges,
    departments,
    job_modes,
    job_types,
    job_categories,
    getUniversityFromDomain: get_universities_from_domain,
  } = useDbRefs();

  type TabKey = "Student Profile" | "Internship Details" | "Calendar";
  const [tab, setTab] = useState<TabKey>("Student Profile");

  const hasProfileErrors = !!(
    formErrors.first_name ||
    formErrors.last_name ||
    formErrors.phone_number ||
    formErrors.university ||
    formErrors.degree
  );
  const hasPrefsErrors = !!(
    formErrors.expected_start_date ||
    formErrors.expected_duration_hours ||
    formErrors.job_mode_ids ||
    formErrors.job_type_ids ||
    formErrors.job_category_ids
  );
  const hasCalendarErrors = !!formErrors.calendar_link;

  useImperativeHandle(ref, () => ({
    save: async () => {
      await validateFormData();
      const hasErrors = Object.values(formErrors).some(Boolean);
      if (hasErrors) {
        if (hasCalendarErrors) setTab("Calendar");
        else if (hasPrefsErrors) setTab("Internship Details");
        else setTab("Student Profile");
        return false;
      }

      const prefs = {
        internship_type: formData.taking_for_credit ? "credited" : "voluntary",
        expected_start_date:
          ymToFirstDayTs(formData.expected_start_date) ?? null,
        expected_duration_hours:
          formData.taking_for_credit === true
            ? typeof formData.expected_duration_hours === "number"
              ? formData.expected_duration_hours
              : null
            : null,
        job_setup_ids: toStrArr(formData.job_mode_ids),
        job_commitment_ids: toStrArr(formData.job_type_ids),
        job_category_ids: toStrArr(formData.job_category_ids),
      } as const;

      const updatedProfile = {
        ...cleanFormData(),
        portfolio_link: toURL(formData.portfolio_link)?.toString(),
        github_link: toURL(formData.github_link)?.toString(),
        linkedin_link: toURL(formData.linkedin_link)?.toString(),
        calendar_link: toURL(formData.calendar_link)?.toString(),
        taking_for_credit:
          typeof formData.taking_for_credit === "boolean"
            ? formData.taking_for_credit
            : false,
        expected_start_date: formData.expected_start_date
          ? /^\d{4}-\d{2}$/.test(formData.expected_start_date)
            ? `${formData.expected_start_date}-01` // store as YYYY-MM-DD
            : formData.expected_start_date // already a full date
          : null,
        expected_duration_hours:
          typeof formData.expected_duration_hours === "number"
            ? formData.expected_duration_hours
            : null,
        // job_mode_ids: formData.job_mode_ids ?? null,
        // job_type_ids: formData.job_type_ids ?? null,
        // job_category_ids: formData.job_category_ids ?? null,
        internship_preferences: {
          ...(formData.internship_preferences ?? {}),
          job_setup_ids: (
            formData.internship_preferences?.job_setup_ids ?? []
          ).map(String),
          job_commitment_ids: (
            formData.internship_preferences?.job_commitment_ids ?? []
          ).map(String),
          job_category_ids:
            formData.internship_preferences?.job_category_ids ?? [],
        },
      };
      await updateProfile(updatedProfile);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      return true;
    },
  }));

  const [universityOptions, setUniversityOptions] = useState(universities);
  const [collegeOptions, setCollegeOptions] = useState(colleges);
  const [departmentOptions, setDepartmentOptions] = useState(departments);
  const [jobModeOptions, setJobModeOptions] = useState(job_modes);
  const [jobTypeOptions, setJobTypeOptions] = useState(job_types);
  const [jobCategoryOptions, setJobCategoryOptions] = useState(job_categories);
  const creditOptions: ChipOpt[] = [
    { value: "credit", label: "Credited" },
    { value: "voluntary", label: "Voluntary" },
  ];

  const creditValue =
    formData.internship_preferences?.internship_type == null
      ? null
      : formData.internship_preferences?.internship_type === "credited"
      ? "credit"
      : "voluntary";

  const handleCreditChange = (v: string | null) => {
    setField("internship_preferences", {
      ...(formData.internship_preferences ?? {}),
      internship_type:
        v === "credit" ? "credited" : v === "voluntary" ? "voluntary" : null,
    });
  };

  const validIdsFromTree = useMemo(() => {
    const s = new Set<string>();
    POSITION_TREE.forEach((p) => {
      if (!p.children?.length) s.add(p.value);
      p.children?.forEach((c) => s.add(c.value));
    });
    return s;
  }, []);

  useEffect(() => {
    setUniversityOptions(universities);
    setJobModeOptions((job_modes ?? []).slice());
    setJobTypeOptions((job_types ?? []).slice());
    setJobCategoryOptions((job_categories ?? []).slice());

    const t = setTimeout(() => validateFormData(), 400);
    return () => clearTimeout(t);
  }, [
    formData,
    universities,
    colleges,
    departments,
    job_modes,
    job_types,
    job_categories,
    get_universities_from_domain,
  ]);

  useEffect(() => {
    addValidator(
      "first_name",
      (name: string) =>
        !isValidRequiredUserName(name) && `First name is not valid.`
    );
    addValidator(
      "last_name",
      (name: string) =>
        !isValidRequiredUserName(name) && `Last name is not valid.`
    );
    addValidator(
      "phone_number",
      (number: string) =>
        !isValidPHNumber(number) && "Invalid Philippine number."
    );
    addValidator(
      "portfolio_link",
      (link: string) => !isValidOptionalURL(link) && "Invalid portfolio link."
    );
    addValidator(
      "github_link",
      (link: string) =>
        !isValidOptionalGitHubURL(link) && "Invalid GitHub link."
    );
    addValidator(
      "linkedin_link",
      (link: string) =>
        !isValidOptionalLinkedinURL(link) && "Invalid LinkedIn link."
    );
    addValidator(
      "university",
      (id: string) =>
        !universityOptions.some((u) => u.id === id) &&
        "Select a valid university."
    );
    addValidator("expected_start_date", (v?: string | null) => {
      if (!v) return "Please select an expected start month.";
      const ym = /^\d{4}-\d{2}$/;
      const ymd = /^\d{4}-\d{2}-\d{2}$/;
      return ym.test(v) || ymd.test(v)
        ? ""
        : "Invalid date format (use YYYY-MM).";
    });
    addValidator("expected_duration_hours", (n?: number | null) => {
      if (formData.taking_for_credit === false) return "";
      if (n == null) return "Please enter expected duration.";
      return Number.isFinite(n as number) &&
        (n as number) >= 0 &&
        (n as number) <= 2000
        ? ""
        : "Enter a valid number of hours (0-2000).";
    });
    addValidator("job_mode_ids", (vals?: number[]) => {
      if (!vals) return "";
      const valid = new Set(jobModeOptions.map((o) => o.id));
      return vals.every((v) => valid.has(v))
        ? ""
        : "Invalid work mode selected.";
    });
    addValidator("job_type_ids", (vals?: number[]) => {
      if (!vals) return "";
      const valid = new Set(jobTypeOptions.map((o) => o.id));
      return vals.every((v) => valid.has(v))
        ? ""
        : "Invalid workload type selected.";
    });
    addValidator("job_category_ids", (vals?: string[]) => {
      if (!vals) return "";
      return vals.every((v) => validIdsFromTree.has(v))
        ? ""
        : "Invalid job category selected.";
    });
  }, [
    universityOptions,
    collegeOptions,
    departmentOptions,
    jobModeOptions,
    jobTypeOptions,
  ]);

  const [showCalendarHelp, setShowCalendarHelp] = useState(false);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const helpPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalendarHelp) return;
    function handleClick(e: MouseEvent) {
      if (
        helpBtnRef.current?.contains(e.target as Node) ||
        helpPopupRef.current?.contains(e.target as Node)
      )
        return;
      setShowCalendarHelp(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCalendarHelp]);

  const didInitNormalize = useRef(false);
  useEffect(() => {
    if (didInitNormalize.current) return;
    didInitNormalize.current = true;

    const current = formData.expected_start_date;
    let next = toYYYYMM(current);

    // If you want a default only when credited:
    if (!next) {
      next = monthFromMs(getNearestMonthTimestamp());
    }

    if (next && next !== current) {
      setField("expected_start_date", next);
    }
  }, []);

  const prefs = formData.internship_preferences ?? {
    job_setup_ids: [],
    job_commitment_ids: [],
    job_category_ids: [],
  };

  // helper for nested updates
  const setPrefsField = <K extends keyof typeof prefs>(key: K, val: any) => {
    setField("internship_preferences", {
      ...prefs,
      [key]: Array.isArray(val) ? val : val, // we'll map to strings in setter below
    });
  };

  return (
    <OutsideTabs
      tabs={[
        {
          key: "Student Profile",
          label: "Student Profile",
          indicator: hasProfileErrors,
        },
        {
          key: "Internship Details",
          label: "Internship Details",
          indicator: hasPrefsErrors,
        },
        // TODO: Reenable for calendar
        // { key: "Calendar", label: "Calendar", indicator: hasCalendarErrors },
      ]}
      rightSlot={rightSlot}
      value={tab}
      onChange={(v) => setTab(v as TabKey)}
    >
      {/* Student Profile */}
      <OutsideTabPanel when="Student Profile" activeKey={tab}>
        {/* Identity */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Identity
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.first_name} />
            <ErrorLabel value={formErrors.middle_name} />
            <ErrorLabel value={formErrors.last_name} />
            <ErrorLabel value={formErrors.phone_number} />
          </div>
          <div
            className={cn(
              "mb-4",
              isMobile ? "flex flex-col space-y-3" : "grid grid-cols-3 gap-2"
            )}
          >
            <FormInput
              label="First Name"
              value={formData.first_name ?? ""}
              setter={fieldSetter("first_name")}
              maxLength={32}
            />
            <FormInput
              label="Middle Name"
              value={formData.middle_name ?? ""}
              setter={fieldSetter("middle_name")}
              maxLength={2}
              required={false}
            />
            <FormInput
              label="Last Name"
              value={formData.last_name ?? ""}
              setter={fieldSetter("last_name")}
            />
          </div>
          <FormInput
            label="Phone Number"
            value={formData.phone_number ?? ""}
            setter={fieldSetter("phone_number")}
          />
        </section>

        <Divider />

        {/* Education */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold mb-2">
            Educational Background
          </div>
          <div className="flex flex-col space-y-3">
            <div>
              <ErrorLabel value={formErrors.university} />
              <Autocomplete
                label={"University"}
                options={universityOptions}
                value={formData.university}
                setter={fieldSetter("university")}
                placeholder="Select University"
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.degree} />
              <FormInput
                label={"Degree"}
                value={formData.degree ?? undefined}
                setter={fieldSetter("degree")}
                placeholder="Indicate degree"
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.expected_graduation_date} />
              <FormMonthPicker
                label="Expected Graduation Date"
                date={
                  formData.expected_graduation_date
                    ? Date.parse(formData.expected_graduation_date)
                    : undefined
                }
                setter={(ms) =>
                  setField(
                    "expected_graduation_date",
                    new Date(ms ?? 0).toISOString()
                  )
                }
                fromYear={2025}
                toYear={2030}
                placeholder="Select month"
              />
            </div>
          </div>
        </section>

        <Divider />

        {/* External Profiles */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            External Profiles
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.portfolio_link} />
            <ErrorLabel value={formErrors.github_link} />
            <ErrorLabel value={formErrors.linkedin_link} />
          </div>
          <div className="flex flex-col space-y-3">
            <FormInput
              label={"Portfolio Link"}
              value={formData.portfolio_link ?? ""}
              setter={fieldSetter("portfolio_link")}
              required={false}
            />
            <FormInput
              label={"GitHub Profile"}
              value={formData.github_link ?? ""}
              setter={fieldSetter("github_link")}
              required={false}
            />
            <FormInput
              label={"LinkedIn Profile"}
              value={formData.linkedin_link ?? ""}
              setter={fieldSetter("linkedin_link")}
              required={false}
            />
          </div>
        </section>

        <Divider />

        {/* Bio */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold mb-2">
            Personal Bio
          </div>
          <textarea
            value={formData.bio || ""}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder="Tell us about yourself: strengths, interests, and goals. Aim for at least 50 characters for a stronger profile."
            className="w-full border rounded-[0.33em] p-3 text-sm min-h-28 resize-none focus-visible:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.bio || "").length}/500 characters
          </p>
        </section>
      </OutsideTabPanel>

      {/* Internship Details */}
      <OutsideTabPanel when="Internship Details" activeKey={tab}>
        <section className="flex flex-col space-y-2 gap-1">
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Internship Details
          </div>

          <div className="mt-2 flex gap-3 items-center">
            <div className="text-xs text-gray-600 mb-1 block">
              Are you looking for internship credit?
            </div>
            <SingleChipSelect
              value={
                formData.internship_preferences?.internship_type === "credited"
                  ? "credit"
                  : formData.internship_preferences?.internship_type ===
                    "voluntary"
                  ? "voluntary"
                  : null
              }
              onChange={(v) =>
                setField("internship_preferences", {
                  ...(formData.internship_preferences ?? {}),
                  internship_type: v === "credit" ? "credited" : "voluntary",
                })
              }
              options={creditOptions}
            />
          </div>

          <FormMonthPicker
            className="w-full"
            label="Ideal internship start"
            date={
              formData.internship_preferences?.expected_start_date ??
              ymToFirstDayTs(formData.expected_start_date)
            }
            setter={(ms?: number) => {
              setField("internship_preferences", {
                ...(formData.internship_preferences ?? {}),
                expected_start_date: ms ?? null, // FormMonthPicker gives ms
              });
            }}
            fromYear={2025}
            toYear={2030}
            required={false}
            placeholder="Select month"
          />

          <ErrorLabel value={formErrors.expected_start_date} />

          {/* TODO: CHECK LEGACY CODE THEN INTERNSHIP PREF */}
          {formData.internship_preferences?.internship_type === "credited" && (
            <div className="mt-3 space-y-2">
              <FormInput
                label="Expected Duration (hours)"
                inputMode="numeric"
                value={
                  formData.internship_preferences?.expected_duration_hours ?? ""
                }
                setter={(v: string) =>
                  setField("internship_preferences", {
                    ...(formData.internship_preferences ?? {}),
                    expected_duration_hours:
                      v === ""
                        ? null
                        : Number.isFinite(Number(v))
                        ? Number(v)
                        : null,
                  })
                }
                required={false}
              />
              <ErrorLabel value={formErrors.expected_duration_hours} />
            </div>
          )}
        </section>

        <Divider />

        {/* Preferences */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Preferences
          </div>

          <div className="mt-2">
            <AutocompleteMulti
              label="Work Modes"
              options={jobModeOptions}
              value={(formData.internship_preferences?.job_setup_ids ?? []).map(
                Number
              )}
              setter={(ids: number[]) =>
                setField("internship_preferences", {
                  ...(formData.internship_preferences ?? {}),
                  job_setup_ids: ids.map(String),
                })
              }
              placeholder="Select one or more"
            />
          </div>

          <div className="mt-2">
            <AutocompleteMulti
              label="Workload Types"
              options={jobTypeOptions}
              value={(
                formData.internship_preferences?.job_commitment_ids ?? []
              ).map(Number)}
              setter={(ids: number[]) =>
                setField("internship_preferences", {
                  ...(formData.internship_preferences ?? {}),
                  job_commitment_ids: ids.map(String),
                })
              }
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_type_ids} />
          </div>

          <div className="mt-2">
            <AutocompleteTreeMulti
              label="Positions / Categories"
              tree={POSITION_TREE} // string ids
              value={formData.internship_preferences?.job_category_ids ?? []}
              setter={(ids: string[]) =>
                setField("internship_preferences", {
                  ...(formData.internship_preferences ?? {}),
                  job_category_ids: ids, // store as string[]
                })
              }
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_category_ids} />
          </div>
        </section>
      </OutsideTabPanel>
    </OutsideTabs>
  );
});
ProfileEditor.displayName = "ProfileEditor";

const ResumeBox = ({
  profile,
  openResumeModal,
}: {
  profile: PublicUser;
  openResumeModal: () => void;
}) => {
  const queryClient = useQueryClient();

  const {
    fileInputRef: resumeFileInputRef,
    upload: resumeUpload,
    isUploading: resumeIsUploading,
  } = useFileUpload({
    uploader: UserService.updateMyResume,
    filename: "resume",
  });

  const hasResume = !!profile.resume;

  return (
    <div className="space-y-3">
      {/* Header row: status + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BoolBadge state={hasResume} onValue="Uploaded" offValue="Missing" />
        </div>

        <div className="flex items-center gap-2">
          {hasResume && (
            <Button
              variant="outline"
              onClick={openResumeModal}
              disabled={resumeIsUploading}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => resumeFileInputRef.current?.open()}
            disabled={resumeIsUploading}
          >
            <Upload className="h-4 w-4" />
            {resumeIsUploading
              ? "Uploading…"
              : hasResume
              ? "Upload new"
              : "Upload"}
          </Button>
        </div>
      </div>

      {/* Optional hint / empty state line */}
      {!hasResume && !resumeIsUploading && (
        <div className="rounded-[0.33em] border border-dashed p-3 text-xs text-muted-foreground">
          No resume yet. Click <span className="font-medium">Upload</span> to
          add your PDF.
        </div>
      )}

      {/* Hidden input handler */}
      <FileUploadInput
        ref={resumeFileInputRef}
        maxSize={2.5}
        allowedTypes={["application/pdf"]}
        onSelect={(file) => {
          // filename display removed by design
          resumeUpload(file);
          queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        }}
      />

      {/* Uploading hint */}
      {resumeIsUploading && (
        <p className="text-xs text-muted-foreground">Uploading your resume…</p>
      )}
    </div>
  );
};

// ----------------------------
//  Link Badge
// ----------------------------
const ProfileLinkBadge = ({
  title,
  link,
  icon,
}: {
  title: string;
  link?: string | null;
  icon?: React.ReactNode;
}) => {
  const enabled = !!link;
  const handleClick = () => {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="justify-start text-xs"
      disabled={!enabled}
      onClick={enabled ? handleClick : undefined}
    >
      {icon ? <span className="">{icon}</span> : null}
      <span>{title}</span>
    </Button>
  );
};

// ----------------------------
//  Helpers
// ----------------------------
const getNearestMonthTimestamp = () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${(
    "0" + (date.getMonth() + 1).toString()
  ).slice(-2)}-01T00:00:00.000Z`;
  return Date.parse(dateString);
};

// For profile score
function computeProfileScore(p?: Partial<PublicUser>): {
  score: number;
  parts: Record<string, boolean>;
  tips: string[];
} {
  const u = p ?? {};
  const parts = {
    name: !!(u.first_name && u.last_name),
    phone: !!u.phone_number,
    bio: !!u.bio && u.bio.trim().length >= 50, // richer bios
    school: !!(u.university && u.degree),
    links: !!(u.github_link || u.linkedin_link || u.portfolio_link),
    prefs: !!(
      u.internship_preferences?.job_category_ids?.length ||
      u.internship_preferences?.job_commitment_ids?.length ||
      u.internship_preferences?.job_setup_ids?.length
    ),
    dates: !!(u.expected_start_date || u.expected_end_date),
    resume: !!u.resume,
  };

  // weights sum to 100
  const weights: Record<keyof typeof parts, number> = {
    name: 10,
    phone: 5,
    bio: 15,
    school: 20,
    links: 10,
    prefs: 20,
    dates: 10,
    resume: 10,
  };

  const score = Object.entries(parts).reduce(
    (acc, [k, ok]) => acc + (ok ? weights[k as keyof typeof parts] : 0),
    0
  );

  const tips: string[] = [];
  if (!parts.bio) tips.push("Add a 50+ character bio highlighting skills.");
  if (!parts.links) tips.push("Add your LinkedIn/GitHub/Portfolio.");
  if (!parts.prefs) tips.push("Pick work modes, types, and roles you want.");
  if (!parts.dates) tips.push("Add expected internship dates.");
  if (!parts.school) tips.push("Complete university/degree fields.");
  if (!parts.resume) tips.push("Upload a resume in PDF (≤2.5MB).");

  return { score, parts, tips };
}

function ymToFirstDayTs(ym?: string | number | null): number | undefined {
  if (ym == null || ym === "") return undefined;

  if (typeof ym === "number") {
    const d = new Date(ym);
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
  }

  // Extract YYYY and MM safely from any string that starts with "YYYY-MM"
  const m = /^(\d{4})-(\d{2})/.exec(String(ym));
  if (!m) return undefined;

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  return new Date(y, mo, 1, 0, 0, 0, 0).getTime(); // local midnight
}

function monthFromMs(ms?: number | null): string | null {
  if (ms == null || Number.isNaN(ms)) return null;
  const d = new Date(ms); // local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// Coerce many date-ish inputs to "YYYY-MM" or null
function toYYYYMM(input?: string | number | null): string | null {
  if (input == null || input === "") return null;

  // Already "YYYY-MM"
  if (typeof input === "string" && /^\d{4}-\d{2}$/.test(input)) return input;

  // If string contains "YYYY-MM" at the start (e.g., "YYYY-MM-DD", ISO)
  if (typeof input === "string") {
    const m = input.match(/^(\d{4}-\d{2})/);
    if (m) return m[1];
  }

  // Timestamp (number or numeric string)
  const n = typeof input === "number" ? input : Number(input);
  if (Number.isFinite(n)) return monthFromMs(n);

  // Fallback: parseable string date
  if (typeof input === "string") {
    const parsed = Date.parse(input);
    if (!Number.isNaN(parsed)) return monthFromMs(parsed);
  }

  return null;
}

const toStrArr = (a?: unknown[] | null) => (a ?? []).map(String);
