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
import {
  Edit2,
  Upload,
  Eye,
  Camera,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Github,
  Linkedin,
  CalendarDays,
} from "lucide-react";
import { useProfile } from "@/lib/api/student.api";
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
import { getFullName } from "@/lib/utils/user-utils";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { toURL, openURL } from "@/lib/utils/url-utils";
import {
  isValidOptionalGitHubURL,
  isValidOptionalLinkedinURL,
  isValidOptionalURL,
} from "@/lib/utils/url-utils";
import { Loader } from "@/components/ui/loader";
import { BoolBadge } from "@/components/ui/badge";
import { cn, isValidPHNumber, toSafeString } from "@/lib/utils";
import { MyUserPfp } from "@/components/shared/pfp";
import { useAppContext } from "@/lib/ctx-app";
import {
  createEditForm,
  FormCheckbox,
  FormDatePicker,
  FormInput,
} from "@/components/EditForm";
import { Divider } from "@/components/ui/divider";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Autocomplete, AutocompleteMulti } from "@/components/ui/autocomplete";
import { isoToMs, msToISO } from "@/lib/utils/date-utils";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import { TabGroup, Tab } from "@/components/ui/tabs";
import { POSITION_TREE } from "@/lib/consts/positions";
import { OutsideTabs, OutsideTabPanel } from "@/components/ui/outside-tabs";

const [ProfileEditForm, useProfileEditForm] = createEditForm<PublicUser>();

export default function ProfilePage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  useEffect(() => {
    if (searchParams.get("edit") === "true") setIsEditing(true);
  }, [searchParams]);

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

  const data = profile.data as PublicUser | undefined;
  const { score, parts, tips } = computeProfileScore(data);

  return (
    data && (
      <div className="min-h-screen w-full">
        {/* Top header */}
        <div className="relative">
          <header className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-10">
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
              <div className="flex-1 w-full min-w-0 mt-1">
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

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    scheme="primary"
                    disabled={isEditing}
                    onClick={() => openEmployerModal()}
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </Button>
                </div>
                {saveError && (
                  <p className="text-xs text-amber-600 mt-2">{saveError}</p>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* Main content */}
        <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Resume */}
            <Card className="p-5">
              <div className="font-medium">Resume/CV</div>

              <ResumeBox profile={data} openResumeModal={openResumeModal} />
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
                  updateProfile={profile.update}
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
                            "Please fix the errors in the form before saving."
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

        {/* Modals */}
        {resumeURL.length > 0 && (
          <ResumeModal>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
              <div className="px-6 pb-6">
                <PDFPreview url={resumeURL} />
              </div>
            </div>
          </ResumeModal>
        )}

        <EmployerModal>
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
          />
        </EmployerModal>
      </div>
    )
  );
}

function HeaderLine({ profile }: { profile: PublicUser }) {
  const { to_level_name, to_degree_full_name, to_university_name } =
    useDbRefs();

  const degree = profile.degree ? to_degree_full_name(profile.degree) : null;
  const uni = profile.university
    ? to_university_name(profile.university)
    : null;
  const level = profile.year_level ? to_level_name(profile.year_level) : null;

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
      {(degree || level || uni) && (
        <div className="flex gap-2">
          <div className="py-1 px-2 rounded-lg border border-gray-300 bg-white flex items-center gap-1 text-sm">
            {uni}
          </div>

          {degree && (
            <div className="py-1 px-2 rounded-lg border border-gray-300 bg-white flex items-center gap-1 text-sm">
              {degree}
            </div>
          )}

          {level && (
            <div className="py-1 px-2 rounded-lg border border-gray-300 bg-white flex items-center gap-1 text-sm">
              {level}
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
  const { isMobile } = useAppContext();
  const { to_level_name, to_degree_full_name, to_university_name } =
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
            {/* <LabeledProperty
              label="College"
              value={profile.college ? to_college_name(profile.college) : "—"}
            />
            <LabeledProperty
              label="Department"
              value={
                profile.department
                  ? to_department_name(profile.department)
                  : "—"
              }
            /> */}
            <LabeledProperty
              label="Degree"
              value={profile.degree ? to_degree_full_name(profile.degree) : "—"}
            />
            <LabeledProperty
              label="Year Level"
              value={
                profile.year_level ? to_level_name(profile.year_level) : "—"
              }
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
              icon={<Github />}
              link={profile.github_link}
            />
            <ProfileLinkBadge
              title="LinkedIn"
              icon={<Linkedin />}
              link={profile.linkedin_link}
            />
            <ProfileLinkBadge
              title="Calendar"
              icon={<CalendarDays />}
              link={profile.calendar_link}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
            <LabeledProperty
              label="Type of internship"
              value={profile.taking_for_credit ? "Credited" : "Voluntary"}
            />

            {profile.taking_for_credit && (
              <LabeledProperty
                label="Expected Duration (hours)"
                value={
                  typeof profile.expected_duration_hours === "number"
                    ? String(profile.expected_duration_hours)
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
            <LabeledProperty
              label="Work Modes"
              value={
                profile.job_mode_ids?.length
                  ? `${profile.job_mode_ids.length} selected`
                  : "—"
              }
            />
            <LabeledProperty
              label="Workload Types"
              value={
                profile.job_type_ids?.length
                  ? `${profile.job_type_ids.length} selected`
                  : "—"
              }
            />
            <LabeledProperty
              label="Positions / Categories"
              value={
                profile.job_category_ids?.length
                  ? `${profile.job_category_ids.length} selected`
                  : "—"
              }
            />
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
    levels,
    universities,
    colleges,
    departments,
    degrees,
    job_modes,
    job_types,
    job_categories,
    getUniversityFromDomain: get_universities_from_domain,
    get_colleges_by_university,
    get_departments_by_college,
    get_degrees_by_university,
  } = useDbRefs();

  type TabKey = "Student Profile" | "Internship Details" | "Calendar";
  const [tab, setTab] = useState<TabKey>("Student Profile");

  const hasProfileErrors = !!(
    formErrors.first_name ||
    formErrors.last_name ||
    formErrors.phone_number ||
    formErrors.university ||
    formErrors.college ||
    formErrors.department ||
    formErrors.degree ||
    formErrors.year_level
  );
  const hasPrefsErrors = !!(
    formErrors.expected_start_date ||
    formErrors.expected_end_date ||
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
      const updatedProfile = {
        ...cleanFormData(),
        portfolio_link: toURL(formData.portfolio_link)?.toString(),
        github_link: toURL(formData.github_link)?.toString(),
        linkedin_link: toURL(formData.linkedin_link)?.toString(),
        calendar_link: toURL(formData.calendar_link)?.toString(),
        expected_start_date: formData.expected_start_date || null,
        expected_end_date: formData.expected_end_date || null,
        expected_duration_hours:
          typeof formData.expected_duration_hours === "number"
            ? formData.expected_duration_hours
            : null,
        job_mode_ids: formData.job_mode_ids ?? null,
        job_type_ids: formData.job_type_ids ?? null,
        job_category_ids: formData.job_category_ids ?? null,
      };
      await updateProfile(updatedProfile);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      return true;
    },
  }));

  const [universityOptions, setUniversityOptions] = useState(universities);
  const [collegeOptions, setCollegeOptions] = useState(colleges);
  const [departmentOptions, setDepartmentOptions] = useState(departments);
  const [degreeOptions, setDegreeOptions] = useState(degrees);
  const [jobModeOptions, setJobModeOptions] = useState(job_modes);
  const [jobTypeOptions, setJobTypeOptions] = useState(job_types);
  const [jobCategoryOptions, setJobCategoryOptions] = useState(job_categories);

  const validIdsFromTree = useMemo(() => {
    const s = new Set<string>();
    POSITION_TREE.forEach((p) => {
      if (!p.children?.length) s.add(p.value);
      p.children?.forEach((c) => s.add(c.value));
    });
    return s;
  }, []);

  useEffect(() => {
    setUniversityOptions(
      universities.filter((u) =>
        get_universities_from_domain(formData.email.split("@")[1]).includes(
          u.id
        )
      )
    );
    setCollegeOptions(
      colleges.filter((c) =>
        get_colleges_by_university(formData.university ?? "").includes(c.id)
      )
    );
    setDepartmentOptions(
      departments.filter((d) =>
        get_departments_by_college(formData.college ?? "").includes(d.id)
      )
    );
    setDegreeOptions(
      degrees
        .filter((d) =>
          get_degrees_by_university(formData.university ?? "").includes(d.id)
        )
        .map((d) => ({ ...d, name: `${d.type} ${d.name}` }))
    );

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
    degrees,
    job_modes,
    job_types,
    job_categories,
    get_universities_from_domain,
    get_colleges_by_university,
    get_departments_by_college,
    get_degrees_by_university,
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
    addValidator(
      "college",
      (id: string) =>
        !collegeOptions.some((c) => c.id === id) && "Select a valid college."
    );
    addValidator(
      "department",
      (id: string) =>
        !departmentOptions.some((d) => d.id === formData.department) &&
        "Select a valid department."
    );
    addValidator(
      "degree",
      (id: string) =>
        !degreeOptions.some((d) => d.id === id) && "Select a valid degree."
    );
    addValidator("year_level", (id: string) =>
      !id || !levels.some((l) => l.id === Number(id))
        ? "Select a valid year level."
        : ""
    );
    addValidator("expected_start_date", (s?: string) => {
      if (!s) return "";
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? "" : "Invalid start date.";
    });
    addValidator("expected_end_date", (s?: string) => {
      if (!s) return "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "Invalid end date.";
      const sMs = isoToMs(formData.expected_start_date);
      const eMs = isoToMs(s);
      return sMs != null && eMs != null && eMs < sMs
        ? "End date must be on/after start date."
        : "";
    });
    addValidator("job_mode_ids", (vals?: string[]) => {
      if (!vals) return "";
      const valid = new Set(jobModeOptions.map((o) => o.id));
      return vals.every((v) => valid.has(v))
        ? ""
        : "Invalid work mode selected.";
    });
    addValidator("job_type_ids", (vals?: string[]) => {
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
    degreeOptions,
    levels,
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
              <Autocomplete
                label={"Degree"}
                options={degreeOptions}
                value={formData.degree}
                setter={fieldSetter("degree")}
                placeholder="Select Degree"
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.year_level} />
              <Autocomplete
                label={"Year Level"}
                options={levels}
                value={formData.year_level}
                setter={fieldSetter("year_level")}
                placeholder="Select Year Level"
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
            className="w-full border rounded-md p-3 text-sm min-h-28 resize-none focus-visible:outline-none focus:ring-2 focus:ring-primary/30"
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

          <div className="flex items-center mt-4">
            <FormCheckbox
              checked={formData.taking_for_credit}
              setter={fieldSetter("taking_for_credit")}
            />
            <div className="text-sm text-muted-foreground ml-3">
              Taking internships for credit?
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <FormDatePicker
              className="w-full"
              label="Expected Start Date"
              date={isoToMs(formData.expected_start_date)}
              setter={(ms?: number) =>
                setField("expected_start_date", msToISO(ms) ?? null)
              }
              required={false}
            />
            <FormDatePicker
              className="w-full"
              label="Expected End Date"
              date={isoToMs(formData.expected_end_date)}
              setter={(ms?: number) =>
                setField("expected_end_date", msToISO(ms) ?? null)
              }
              required={false}
            />
          </div>

          <FormInput
            label="Expected Duration (hours)"
            type="number"
            inputMode="numeric"
            value={formData.expected_duration_hours ?? ""}
            setter={(v: string) => {
              const n = v === "" || v == null ? null : Number(v);
              setField(
                "expected_duration_hours",
                Number.isFinite(n as number) ? (n as number) : null
              );
            }}
            required={false}
          />
        </section>

        <Divider />

        {/* Preferences */}
        <section>
          <div className="text-xl sm:text-2xl tracking-tight font-semibold">
            Preferences
          </div>

          <div className="mt-2">
            <AutocompleteMulti
              label={"Work Modes"}
              options={jobModeOptions}
              value={formData.job_mode_ids ?? []}
              setter={fieldSetter("job_mode_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_mode_ids} />
          </div>

          <div className="mt-2">
            <AutocompleteMulti
              label={"Workload Types"}
              options={jobTypeOptions}
              value={formData.job_type_ids ?? []}
              setter={fieldSetter("job_type_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_type_ids} />
          </div>

          <div className="mt-2">
            <AutocompleteTreeMulti
              label={"Positions / Categories"}
              tree={POSITION_TREE}
              value={formData.job_category_ids ?? []}
              setter={fieldSetter("job_category_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_category_ids} />
          </div>
        </section>
      </OutsideTabPanel>

      {/* Optional Calendar tab */}
      {/* 
    <OutsideTabPanel when="Calendar" activeKey={tab}>
      <section>
        <div className="text-xl sm:text-2xl tracking-tight font-semibold">Calendar</div>
        <div className="flex flex-col space-y-1 mb-2">
          <ErrorLabel value={formErrors.calendar_link} />
        </div>
        <div className="relative flex flex-col">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">
              Calendar Link <span className="text-muted-foreground font-normal">(optional)</span>
            </span>
            // your help icon + popover…
          </div>
          <FormInput
            label={undefined}
            value={formData.calendar_link ?? ""}
            setter={fieldSetter("calendar_link")}
            required={false}
          />
        </div>
      </section>
    </OutsideTabPanel>
    */}
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
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
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
    school: !!(
      u.university &&
      u.college &&
      u.department &&
      u.degree &&
      u.year_level
    ),
    links: !!(u.github_link || u.linkedin_link || u.portfolio_link),
    prefs: !!(
      u.job_mode_ids?.length ||
      u.job_type_ids?.length ||
      u.job_category_ids?.length
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
  if (!parts.school) tips.push("Complete university/college/degree fields.");
  if (!parts.resume) tips.push("Upload a resume in PDF (≤2.5MB).");

  return { score, parts, tips };
}
