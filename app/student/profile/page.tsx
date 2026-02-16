"use client";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "framer-motion";
import {
  Edit2,
  Upload,
  Eye,
  Camera,
  CheckCircle2,
  Globe2,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { useAuthContext } from "../../../lib/ctx-auth";
import { useModal } from "@/hooks/use-modal";
import { useDbRefs } from "@/lib/db/use-refs";
import { InternshipPreferences, PublicUser } from "@/lib/db/db.types";
import { ErrorLabel, LabeledProperty } from "@/components/ui/labels";
import { UserService } from "@/lib/api/services";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { Button } from "@/components/ui/button";
import { FileUploadInput, useFile, useFileUpload } from "@/hooks/use-file";
import { Card } from "@/components/ui/card";
import {
  getFullName,
  isProfileBaseComplete,
  isProfileResume,
} from "@/lib/profile";
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
  FormDropdown,
} from "@/components/EditForm";
import { Divider } from "@/components/ui/divider";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
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
import useModalRegistry from "@/components/modals/modal-registry";

const [ProfileEditForm, useProfileEditForm] = createEditForm<PublicUser>();

export default function ProfilePage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfileData();
  const profileActions = useProfileActions();
  const modalRegistry = useModalRegistry();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoApplySaving, setAutoApplySaving] = useState(false);
  const [autoApplyError, setAutoApplyError] = useState<string | null>(null);
  const router = useRouter();

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

  const { open: openResumeModal } = useModal("resume-modal");
  const profileEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const openEmployerWithResume = async () => {
    await syncResumeURL();
    openEmployerModal();
  };

  const handleAutoApplySave = async (newEnabled: boolean) => {
    setAutoApplySaving(true);
    setAutoApplyError(null);

    const prev = !!profile.data?.apply_for_me;

    try {
      // await profileActions.update.mutateAsync({ apply_for_me: !prev });
      await UserService.updateMyProfile({
        apply_for_me: newEnabled,
        auto_apply_enabled_at: newEnabled ? new Date().toISOString() : null,
      })
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });

      // console.log("apply_for_me: ", profile?.data?.apply_for_me);
      // console.log("auto_apply_enabled_at:", profile.data?.auto_apply_enabled_at);
    } catch (e: any) {
      setAutoApplyError((e as string) ?? "Failed to update auto-apply");
    } finally {
      setAutoApplySaving(false);
    }
  };

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
    if (data?.resume) void syncResumeURL();
  }, [data?.resume, syncResumeURL]);

  useEffect(() => {
    if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data) ||
      profile.data?.acknowledged_auto_apply === false
    ) {
      router.push(`/forms`);
    }
  }, []);

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

  if (
    !isProfileResume(profile.data) ||
    !isProfileBaseComplete(profile.data) ||
    profile.data?.acknowledged_auto_apply === false
  ) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <FileQuestion className="text-warning w-20 h-20" />
        <span className="text-lg text-gray-500">
          Page Paused, Please Reload
        </span>
      </div>
    );
  }

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
                    void queryClient.invalidateQueries({
                      queryKey: ["my-profile"],
                    })
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
                      onClick={() =>
                        void (async () => {
                          setSaving(true);
                          setSaveError(null);
                          const success =
                            await profileEditorRef.current?.save();
                          setSaving(false);
                          if (success) setIsEditing(false);
                          else
                            setSaveError(
                              "Please fix the errors in the form before saving.", // TODO: Make this a toast
                            );
                        })()
                      }
                      disabled={saving}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin"></Loader2>
                        </>
                      ) : (
                        <>Save</>
                      )}
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
              enabledAt={data?.auto_apply_enabled_at}
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
                        : "border-amber-500/40 text-amber-700",
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 mr-1",
                        ok ? "opacity-100" : "opacity-50",
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
            open_resume={() =>
              void (async () => {
                closeEmployerModal();
                await syncResumeURL();
                openResumeModal();
              })()
            }
            open_calendar={() => {
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
  const internshipPreferences = profile.internship_preferences;

  const degree = profile.degree ?? null;
  const uni = profile.university
    ? to_university_name(profile.university)
    : null;
  const expectedGraduationDate = profile.expected_graduation_date ?? null;
  const chips: string[] = [];

  if (internshipPreferences?.expected_start_date) {
    const start = internshipPreferences.expected_start_date;
    chips.push(`Availability: ${start ? "from " + start : "—"}`);
  }

  if (internshipPreferences?.job_setup_ids?.length)
    chips.push(`Setups: ${internshipPreferences?.job_setup_ids.length}`);
  if (internshipPreferences?.job_commitment_ids?.length)
    chips.push(
      `Commitment: ${internshipPreferences?.job_commitment_ids?.length}`,
    );
  if (internshipPreferences?.job_category_ids?.length)
    chips.push(`Roles: ${internshipPreferences?.job_category_ids?.length}`);

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
  const internshipPreferences = profile.internship_preferences;
  const {
    to_university_name,
    to_college_name,
    to_department_name,
    job_modes,
    job_types,
    job_categories,
  } = useDbRefs();

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
          <Button onClick={onEdit} className="text-xs">
            <Edit2 className="h-3 w-3" /> Edit
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
            <LabeledProperty
              label="Degree / Program"
              value={profile.degree ?? "-"}
            />
            <LabeledProperty
              label="College / School"
              value={profile.college ? to_college_name(profile.college) : "-"}
            />
            <LabeledProperty
              label="Department"
              value={
                profile.department
                  ? to_department_name(profile.department)
                  : "-"
              }
            />
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
              value={internshipPreferences?.internship_type ?? "—"}
            />
            <LabeledProperty
              label="Ideal internship start"
              value={
                internshipPreferences?.expected_start_date
                  ? toYYYYMM(internshipPreferences.expected_start_date)
                  : "—"
              }
            />
            {internshipPreferences?.internship_type === "credited" && (
              <LabeledProperty
                label="Expected Duration (hours)"
                value={
                  typeof internshipPreferences?.expected_duration_hours ===
                  "number"
                    ? String(internshipPreferences?.expected_duration_hours)
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
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Work Modes
              </div>
              {(() => {
                const ids = (internshipPreferences?.job_setup_ids ?? []) as (
                  | string
                  | number
                )[];
                const items = ids
                  .map((id) => {
                    const m = job_modes.find(
                      (x) => String(x.id) === String(id),
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

            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Workload Types
              </div>
              {(() => {
                const ids = (profile.internship_preferences
                  ?.job_commitment_ids ??
                  internshipPreferences?.job_commitment_ids ??
                  []) as (string | number)[];
                const items = ids
                  .map((id) => {
                    const t = job_types.find(
                      (x) => String(x.id) === String(id),
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

            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground mb-1">
                Positions / Categories
              </div>
              {(() => {
                const ids = internshipPreferences?.job_category_ids ?? [];
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
    get_colleges_by_university,
    get_departments_by_college,
    to_university_name,
    to_college_name,
    to_department_name,
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
  const hasPrefsErrors = !!formErrors.internship_preferences;
  const hasCalendarErrors = !!formErrors.calendar_link;

  useImperativeHandle(ref, () => ({
    save: async () => {
      validateFormData();
      const hasErrors = Object.values(formErrors).some(Boolean);
      if (hasErrors) {
        if (hasCalendarErrors) setTab("Calendar");
        else if (hasPrefsErrors) setTab("Internship Details");
        else setTab("Student Profile");
        return false;
      }

      const updatedProfile = {
        ...cleanFormData(),
        portfolio_link: toURL(formData.portfolio_link)?.toString(),
        github_link: toURL(formData.github_link)?.toString(),
        linkedin_link: toURL(formData.linkedin_link)?.toString(),
        calendar_link: toURL(formData.calendar_link)?.toString(),
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
      updateProfile(updatedProfile);
      await qc.refetchQueries({ queryKey: ["my-profile"] });
      return true;
    },
  }));

  const [universityOptions, setUniversityOptions] = useState(universities);
  const [collegesOptions, setCollegesOptions] = useState(colleges);
  const [departmentOptions, setDepartmentOptions] = useState(departments);
  const [jobModeOptions, setJobModeOptions] = useState(job_modes);
  const [jobTypeOptions, setJobTypeOptions] = useState(job_types);
  const [jobCategoryOptions, setJobCategoryOptions] = useState(job_categories);
  const creditOptions: ChipOpt[] = [
    { value: "credit", label: "Credited" },
    { value: "voluntary", label: "Voluntary" },
  ];

  useEffect(() => {
    setUniversityOptions(universities);
    setDepartmentOptions(departments);
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
    get_departments_by_college,
  ]);

  useEffect(() => {
    addValidator(
      "first_name",
      (name: string) =>
        !isValidRequiredUserName(name) && `First name is not valid.`,
    );
    addValidator(
      "last_name",
      (name: string) =>
        !isValidRequiredUserName(name) && `Last name is not valid.`,
    );
    addValidator(
      "phone_number",
      (number: string) =>
        !isValidPHNumber(number) && "Invalid Philippine number.",
    );
    addValidator(
      "portfolio_link",
      (link: string) => !isValidOptionalURL(link) && "Invalid portfolio link.",
    );
    addValidator(
      "github_link",
      (link: string) =>
        !isValidOptionalGitHubURL(link) && "Invalid GitHub link.",
    );
    addValidator(
      "linkedin_link",
      (link: string) =>
        !isValidOptionalLinkedinURL(link) && "Invalid LinkedIn link.",
    );
    addValidator(
      "university",
      (id: string) =>
        !universityOptions.some((u) => u.id === id) &&
        "Select a valid university.",
    );
    addValidator(
      "college",
      (id: string) =>
        !colleges.some((c) => c.id === id) && "Select a valid college.",
    );
    addValidator(
      "department",
      (id: string) =>
        !departmentOptions.some((d) => d.id === id) &&
        "Select a valid department.",
    );
    addValidator("internship_preferences", (i: InternshipPreferences) => {
      // Specify start month
      if (!i.expected_start_date)
        return "Please select an expected start month.";

      // If credited, check if number of hours are valid
      if (i?.internship_type === "credited") {
        if (!i.expected_duration_hours)
          return "Please enter expected duration.";
        if (
          !Number.isFinite(i.expected_duration_hours) ||
          i.expected_duration_hours < 100 ||
          i.expected_duration_hours > 2000
        )
          return "Enter a valid number of hours (100-2000)";
      }

      // If job setup ids were specified, check that all are valid
      if (i.job_setup_ids) {
        const valid = new Set(jobModeOptions.map((o) => o.id.toString()));
        if (!i.job_setup_ids.every((v) => valid.has(v)))
          return "Invalid work setup selected.";
      }

      // If job commitment ids were specified, check that all are valid
      if (i.job_commitment_ids) {
        const valid = new Set(jobTypeOptions.map((o) => o.id.toString()));
        if (!i.job_commitment_ids.every((v) => valid.has(v)))
          return "Invalid work commitment selected.";
      }

      // If job categories selected, check that they're valid
      if (i.job_category_ids) {
        const valid = new Set(jobCategoryOptions.map((o) => o.id.toString()));
        if (!i.job_category_ids.every((v) => valid.has(v)))
          return "Invalid work category selected.";
      }

      return "";
    });
  }, [universityOptions, jobModeOptions, jobTypeOptions]);

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

    const current = formData.internship_preferences?.expected_start_date;
    let next = current;

    // If you want a default only when credited:
    if (!next) next = getNearestMonthTimestamp();
    if (next && next !== current) {
      setField("internship_preferences", {
        ...formData.internship_preferences,
        expected_start_date: next,
      });
    }
  }, []);

  // realtime updating the department based on the college (and university fallback)
  useEffect(() => {
    const collegeId = formData.college;
    const universityId = formData.university;

    // If a specific college is selected -> show departments only for that college
    if (collegeId) {
      const list = get_departments_by_college?.(collegeId) ?? [];
      const mapped = list.map((d) => ({ id: d, name: to_department_name(d) }));
      setDepartmentOptions(mapped);

      // if selected department is not in new list -> clear it
      if (
        formData.department &&
        !mapped.some((m) => m.id === formData.department)
      ) {
        setField("department", undefined);
      }

      return;
    }

    // No college selected but a university is selected -> aggregate departments for all colleges of that university
    if (universityId) {
      const collegeIds = get_colleges_by_university?.(universityId) ?? [];

      // collect departments from each college, dedupe
      const deptSet = new Map<string, { id: string; name: string }>();
      for (const cId of collegeIds) {
        const list = get_departments_by_college?.(cId) ?? [];
        for (const d of list) {
          if (!deptSet.has(d)) {
            deptSet.set(d, { id: d, name: to_department_name(d) });
          }
        }
      }
      const aggregated = Array.from(deptSet.values());
      setDepartmentOptions(aggregated);

      // If current selected department isn't part of aggregated -> clear it
      if (
        formData.department &&
        !aggregated.some((a) => a.id === formData.department)
      ) {
        setField("department", undefined);
      }
      return;
    }

    // Neither college nor university -> show all departments
    setDepartmentOptions(departments.map((d) => ({ id: d.id, name: d.name })));
    if (formData.department) setField("department", undefined);
  }, [
    formData.college,
    formData.department,
    formData.university,
    departments,
    get_departments_by_college,
    get_colleges_by_university,
    to_department_name,
    setField,
  ]);

  // for realtime updating the department based on the university
  useEffect(() => {
    const universityId = formData.university;
    console.log(
      "Selected university:",
      universityId,
      to_university_name(universityId),
    );

    if (universityId) {
      const list = get_colleges_by_university?.(universityId) ?? [];
      const mapped = list.map((d) => ({
        id: d,
        name: to_college_name(d) ?? "",
        short_name: "",
        university_id: universityId,
      }));
      setCollegesOptions(mapped);

      // If the currently selected college is not in the new mapped list, clear it (and department)
      if (formData.college && !mapped.some((c) => c.id === formData.college)) {
        setField("college", undefined);
        setField("department", undefined);
      }
    } else {
      // no university selected -> show all colleges and clear college/department
      setCollegesOptions(
        colleges.map((d) => ({
          id: d.id,
          name: d.name,
          short_name: d.short_name,
          university_id: d.university_id,
        })),
      );

      // Clear selected college and department because no university is chosen
      if (formData.college) setField("college", undefined);
      if (formData.department) setField("department", undefined);
    }
  }, [formData.university, formData.college, colleges]);

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
              isMobile ? "flex flex-col space-y-3" : "grid grid-cols-3 gap-2",
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
              <ErrorLabel value={formErrors.college} />
              <FormDropdown
                label={"College"}
                value={formData.college ?? undefined}
                setter={fieldSetter("college")}
                options={collegesOptions.map((c) => ({
                  id: c.id,
                  name: c.name,
                }))}
                placeholder="Indicate college"
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.department} />
              <FormDropdown
                label="Department"
                value={formData.department ?? undefined}
                setter={fieldSetter("department")}
                options={departmentOptions}
                placeholder={
                  formData.college
                    ? "Indicate department"
                    : "Select a college first"
                }
                disabled={!formData.college}
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.degree} />
              <FormInput
                label={"Degree / Program"}
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
                    new Date(ms ?? 0).toISOString(),
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
                  : "voluntary"
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
            date={formData.internship_preferences?.expected_start_date ?? 0}
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

          <ErrorLabel value={formErrors.internship_preferences} />

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
                Number,
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
              className="hidden sm:inline-flex"
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
        onSelect={async (file) => {
          // filename display removed by design
          const success = await resumeUpload(file);
          
          if(success) {
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
          } 
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
    dates: !!u.internship_preferences?.expected_start_date,
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
    0,
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
