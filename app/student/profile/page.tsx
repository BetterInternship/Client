"use client";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
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
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { useAuthContext } from "../../../lib/ctx-auth";
import { useModal } from "@/hooks/use-modal";
import { useDbRefs } from "@/lib/db/use-refs";
import { InternshipPreferences, PublicUser, Resume } from "@/lib/db/db.types";
import { ErrorLabel, LabeledProperty } from "@/components/ui/labels";
import { UserService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { FileUploadInput, useFile, useFileUpload } from "@/hooks/use-file";
import { Card } from "@/components/ui/card";
import { getFullName } from "@/lib/profile";
import { toURL } from "@/lib/utils/url-utils";
import {
  isValidOptionalGitHubURL,
  isValidOptionalLinkedinURL,
  isValidOptionalURL,
} from "@/lib/utils/url-utils";
import { Loader } from "@/components/ui/loader";
import { cn, formatMonth, isValidPHNumber, toSafeString } from "@/lib/utils";
import { formatOptionalStartMonth } from "@/lib/utils/date-utils";
import { MyUserPfp, PFP_UPDATED_EVENT } from "@/components/shared/pfp";
import { useAppContext } from "@/lib/ctx-app";
import {
  createEditForm,
  FormMonthPicker,
  FormInput,
} from "@/components/EditForm";
import { Divider } from "@/components/ui/divider";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useProfileActions } from "@/lib/api/student.actions.api";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { useBlockPageRefreshEffect } from "@/hooks/use-refresh-block";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { AddResumeModal } from "@/components/features/student/profile/AddResumeModal";
import useModalRegistry from "@/components/modals/modal-registry";

const [ProfileEditForm, useProfileEditForm] = createEditForm<PublicUser>();

export default function ProfilePage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfileData();
  const profileActions = useProfileActions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [isRenamingResume, setIsRenamingResume] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: (resumeId: string) => UserService.getMyResumeURL(resumeId),
    route: (resumeId: string) => `/users/me/resume/${resumeId}`,
  });
  const resumes = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => UserService.getMyResumes(),
  });

  const maxResumesEnv = Number(process.env.NEXT_PUBLIC_MAX_RESUMES_ALLOWED);
  const maxResumesAllowed = Number.isFinite(maxResumesEnv) ? maxResumesEnv : 5;
  const resumeCount = resumes.data?.resumes?.length ?? 0;
  const atResumeLimit = resumeCount >= maxResumesAllowed;

  // Modals
  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");
  const {
    open: openAddResumeModal,
    close: closeAddResumeModal,
    Modal: AddResumeModalBox,
  } = useModal("add-resume-modal");

  const profileEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const modalRegistry = useModalRegistry();

  const openResumePreview = async (resumeId: string) => {
    await syncResumeURL(resumeId);
    openResumeModal();
  };

  const onRenameResume = async (resumeId: string, label: string) => {
    if (!resumeId) {
      toast.error("Resume not found.");
      return false;
    }

    const nextLabel = label.trim();
    if (!nextLabel) {
      toast.error("Resume label is required.");
      return false;
    }

    setIsRenamingResume(true);
    try {
      const result = await UserService.updateMyResume(resumeId, nextLabel);
      if (!result?.success) {
        const errorMessage =
          (result as { error?: string })?.error ||
          result?.message ||
          "Failed to rename resume.";
        toast.error(errorMessage, toastPresets.destructive);
        return false;
      }

      toast.success("Resume renamed successfully.", toastPresets.success);
      void resumes.refetch();
      void queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
      return true;
    } catch (error) {
      toast.error("Resume could not be renamed. Try again.");
      return false;
    } finally {
      setIsRenamingResume(false);
    }
  };

  const onDeleteResume = (resume: Resume) => {
    if (!resume.id) {
      toast.error("Resume not found.");
      return;
    }

    modalRegistry.deleteResume.open({
      resume,
      isProcessing: isDeletingResume,
      onConfirm: async () => {
        setIsDeletingResume(true);
        try {
          const result = await UserService.deleteMyResume(resume.id);
          if (!result?.success) {
            const errorMessage =
              (result as { error?: string })?.error ||
              result?.message ||
              "Failed to delete resume.";
            toast.error(errorMessage, toastPresets.destructive);
            return;
          }

          modalRegistry.deleteResume.close();
          toast.success("Resume deleted successfully.", toastPresets.success);
          void resumes.refetch();
          void queryClient.invalidateQueries({
            queryKey: ["my-profile"],
          });
        } catch (error) {
          toast.error("Resume could not be deleted. Try again.");
        } finally {
          setIsDeletingResume(false);
        }
      },
    });
  };

  redirectIfNotLoggedIn();

  const {
    fileInputRef: pfpFileInputRef,
    upload: pfpUpload,
    isUploading: pfpIsUploading,
  } = useFileUpload({
    uploader: (file: FormData) => UserService.updateMyPfp(file),
    filename: "pfp",
    silent: true,
  });

  const data = profile.data as PublicUser | undefined;

  useEffect(() => {
    if (searchParams.get("edit") === "true") setIsEditing(true);
  }, [searchParams]);

  useBlockPageRefreshEffect(isEditing);

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

  return (
    data && (
      <div className="min-h-screen mx-auto max-w-2xl w-full">
        {/* Top header */}
        <div className="relative">
          <header className="relative px-4 sm:px-6 pt-10">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
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
                  onSelect={(file) => {
                    void pfpUpload(file).then((success) => {
                      if (success) {
                        void queryClient.invalidateQueries({
                          queryKey: ["my-profile"],
                        });
                        window.dispatchEvent(new Event(PFP_UPDATED_EVENT));
                        toast.success(
                          "Profile photo uploaded successfully.",
                          toastPresets.success,
                        );
                      }
                    });
                  }}
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
        <main className="w-full p-6">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Profile */}
            {!isEditing && (
              <>
                <ProfileReadOnlyTabs
                  profile={data}
                  resumes={resumes.data?.resumes ?? []}
                  resumesLoading={resumes.isPending}
                  onViewResume={openResumePreview}
                  onResumeUploaded={() => {
                    void resumes.refetch();
                    void queryClient.invalidateQueries({
                      queryKey: ["my-profile"],
                    });
                  }}
                  onEdit={() => setIsEditing(true)}
                  onAddResume={openAddResumeModal}
                  onRenameResume={onRenameResume}
                  onDeleteResume={onDeleteResume}
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
                          if (success) {
                            setIsEditing(false);
                            toast.success(
                              "Profile saved successfully.",
                              toastPresets.success,
                            );
                          } else
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
        </main>

        <ResumeModal className="max-w-[80vw]">
          <PDFPreview url={resumeURL} />
        </ResumeModal>

        <AddResumeModalBox>
          <AddResumeModal
            onCancel={closeAddResumeModal}
            onComplete={() => {
              closeAddResumeModal();
              void resumes.refetch();
              void queryClient.invalidateQueries({
                queryKey: ["my-profile"],
              });
            }}
            isAtResumeLimit={atResumeLimit}
          />
        </AddResumeModalBox>
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
  resumes,
  resumesLoading,
  onViewResume,
  onRenameResume,
  onDeleteResume,
  onEdit,
  onAddResume,
  onResumeUploaded,
}: {
  profile: PublicUser;
  resumes: Resume[];
  resumesLoading: boolean;
  onViewResume: (resumeId: string) => void | Promise<void>;
  onRenameResume: (resumeId: string, label: string) => Promise<boolean>;
  onDeleteResume: (resume: Resume) => void | Promise<void>;
  onEdit: () => void;
  onAddResume: () => void;
  onResumeUploaded: () => void;
}) {
  const internshipPreferences = profile.internship_preferences;
  const { to_university_name, job_modes, job_types, job_categories } =
    useDbRefs();

  type TabKey = "Student Profile" | "Internship Details" | "Resumes";

  const SECTION_TO_TAB: Record<string, TabKey> = {
    student: "Student Profile",
    internship: "Internship Details",
    resumes: "Resumes",
  };
  const TAB_TO_SECTION: Record<TabKey, string> = {
    "Student Profile": "student",
    "Internship Details": "internship",
    Resumes: "resumes",
  };

  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") ?? "";
  const initialTab = SECTION_TO_TAB[sectionParam] ?? "Student Profile";

  const [tab, setTab] = useState<TabKey>(initialTab);

  const handleTabChange = (v: string) => {
    const newTab = v as TabKey;
    setTab(newTab);

    const section = TAB_TO_SECTION[newTab];
    const url = new URL(window.location.href);
    if (section === "student") {
      url.searchParams.delete("section");
    } else {
      url.searchParams.set("section", section);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const tabs = [
    { key: "Student Profile", label: "Student Profile" },
    { key: "Internship Details", label: "Internship Details" },
    { key: "Resumes", label: "Resumes" },
  ] as const;

  return (
    <OutsideTabs
      tabs={tabs as unknown as { key: string; label: string }[]}
      value={tab}
      onChange={handleTabChange}
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
              value={formatOptionalStartMonth(
                internshipPreferences?.expected_start_date,
              )}
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

      <OutsideTabPanel when="Resumes" activeKey={tab}>
        <ResumeList
          resumes={resumes}
          loading={resumesLoading}
          onViewResume={onViewResume}
          onAddResume={onAddResume}
          onResumeUploaded={onResumeUploaded}
          onRenameResume={onRenameResume}
          onDeleteResume={onDeleteResume}
        />
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
  const { universities, job_modes, job_types, job_categories } = useDbRefs();

  type TabKey = "Student Profile" | "Internship Details" | "Calendar";
  const [tab, setTab] = useState<TabKey>("Student Profile");

  const hasProfileErrors = !!(
    formErrors.first_name ||
    formErrors.last_name ||
    formErrors.phone_number ||
    formErrors.university
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
      return true;
    },
  }));

  const [universityOptions, setUniversityOptions] = useState(universities);
  const [jobModeOptions, setJobModeOptions] = useState(job_modes);
  const [jobTypeOptions, setJobTypeOptions] = useState(job_types);
  const [jobCategoryOptions, setJobCategoryOptions] = useState(job_categories);
  const creditOptions: ChipOpt[] = [
    { value: "credit", label: "Credited" },
    { value: "voluntary", label: "Voluntary" },
  ];

  useEffect(() => {
    setUniversityOptions(universities?.filter((u) => u.name));
    setJobModeOptions((job_modes ?? []).slice());
    setJobTypeOptions((job_types ?? []).slice());
    setJobCategoryOptions((job_categories ?? []).slice());

    const t = setTimeout(() => validateFormData(), 400);
    return () => clearTimeout(t);
  }, [formData, universities, job_modes, job_types, job_categories]);

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
    addValidator("phone_number", (number: string) => {
      if (!number?.trim()) return false;
      return !isValidPHNumber(number) && "Invalid Philippine number.";
    });
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

      return false;
    });
  }, [universityOptions, jobModeOptions, jobTypeOptions, jobCategoryOptions]);

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
              maxLength={32}
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
            required={false}
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
              <FormInput
                label={"Degree / Program"}
                value={formData.degree ?? undefined}
                setter={fieldSetter("degree")}
                placeholder="Indicate degree"
                required={false}
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
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 4}
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
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 4}
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

const ResumeList = ({
  resumes,
  loading,
  onViewResume,
  onRenameResume,
  isRenamingResume,
  onDeleteResume,
  onAddResume,
  onResumeUploaded,
}: {
  resumes: Resume[];
  loading: boolean;
  onViewResume: (resumeId: string) => void | Promise<void>;
  onRenameResume: (resumeId: string, label: string) => Promise<boolean>;
  isRenamingResume: boolean;
  onDeleteResume: (resume: Resume) => void | Promise<void>;
  onAddResume: () => void;
  onResumeUploaded: () => void;
}) => {
  const maxResumesEnv = Number(process.env.NEXT_PUBLIC_MAX_RESUMES_ALLOWED);
  const maxResumesAllowed = Number.isFinite(maxResumesEnv) ? maxResumesEnv : 5;
  const atResumeLimit = resumes.length >= maxResumesAllowed;

  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const sortedResumes = useMemo(
    () => [...resumes].sort(compareResumesByUploadedAtDesc),
    [resumes],
  );

  const startEditing = (resume: Resume) => {
    if (!resume.id) {
      toast.error("Resume not found.");
      return;
    }
    setEditingResumeId(resume.id);
    setEditingLabel(resume.label ?? "");
  };

  const cancelEditing = () => {
    setEditingResumeId(null);
    setEditingLabel("");
  };

  return (
    <section>
      <div className="text-xl sm:text-2xl tracking-tight font-semibold">
        Resumes
      </div>

      <div className="mt-3 divide-y rounded-[0.33em] border">
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">
            Loading resumes...
          </div>
        )}
        {!loading && resumes.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No resumes uploaded yet.
          </div>
        )}
        {!loading &&
          sortedResumes.map((resume) => {
            const isEditing = editingResumeId === resume.id;
            const currentLabel = resume.label ?? "";

            const handleSave = () => {
              if (!resume.id) {
                toast.error("Resume not found.");
                return;
              }

              const nextLabel = editingLabel.trim();
              if (!nextLabel) {
                toast.error("Resume label is required.");
                return;
              }

              if (nextLabel === currentLabel) {
                cancelEditing();
                return;
              }

              void (async () => {
                const success = await onRenameResume(resume.id, nextLabel);
                if (success) cancelEditing();
              })();
            };

            return (
              <div
                key={resume.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <FormInput
                          value={editingLabel}
                          setter={setEditingLabel}
                          required={false}
                          placeholder="Resume label"
                          aria-label="Resume label"
                          className="w-full"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleSave();
                            } else if (event.key === "Escape") {
                              event.preventDefault();
                              cancelEditing();
                            }
                          }}
                          disabled={isRenamingResume}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSave}
                          aria-label="Save resume label"
                          disabled={isRenamingResume}
                        >
                          {isRenamingResume ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          aria-label="Cancel rename"
                          disabled={isRenamingResume}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="truncate text-sm font-medium text-gray-900">
                      <FormInput
                        value={
                          resume.label || resume.filename || "Untitled resume"
                        }
                        className={"border-none p-0"}
                        disabled={isRenamingResume}
                      />
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Uploaded {formatResumeUploadedAt(resume.uploaded_at)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void onViewResume(resume.id)}
                    aria-label={`View ${resume.label || "resume"}`}
                    disabled={isRenamingResume || isEditing}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => void startEditing(resume)}
                      aria-label={`Rename ${resume.label || "resume"}`}
                      disabled={isRenamingResume}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    scheme="destructive"
                    variant="outline"
                    size="icon"
                    onClick={() => void onDeleteResume(resume)}
                    aria-label={`Delete ${resume.label || "resume"}`}
                    disabled={isRenamingResume || isEditing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      {!loading && resumes.length === 0 && (
        <div className="mt-3 rounded-[0.33em] border border-dashed p-3 text-xs text-muted-foreground">
          Upload a PDF resume to make it available when applying.
        </div>
      )}

      <div className="mt-4 flex justify-between items-center gap-2">
        <span className="text-muted-foreground text-sm">
          You can have up to {maxResumesAllowed} resumes.
        </span>
        <Button onClick={onAddResume} disabled={atResumeLimit}>
          <Upload className="h-4 w-4 mr-1.5" />
          Add resume
        </Button>
      </div>
    </section>
  );
};

function compareResumesByUploadedAtDesc(first: Resume, second: Resume) {
  const firstUploadedAt = new Date(first.uploaded_at).getTime();
  const secondUploadedAt = new Date(second.uploaded_at).getTime();
  const firstTime = Number.isNaN(firstUploadedAt) ? 0 : firstUploadedAt;
  const secondTime = Number.isNaN(secondUploadedAt) ? 0 : secondUploadedAt;

  return secondTime - firstTime;
}

function formatResumeUploadedAt(uploadedAt: string) {
  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) return "unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
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
    bio: !!u.bio && u.bio.trim().length >= 50, // richer bios
    school: !!u.university,
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
    bio: 15,
    school: 20,
    links: 10,
    prefs: 25,
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
  if (!parts.school) tips.push("Add your university.");
  if (!parts.resume) tips.push("Upload a resume in PDF (≤2.5MB).");

  return { score, parts, tips };
}
