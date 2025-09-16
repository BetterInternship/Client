"use client";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  Edit2,
  Upload,
  Eye,
  Camera,
  MessageCircleQuestion,
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
import {
  isValidOptionalLinkedinURL,
  isValidOptionalCalendarURL,
  toURL,
  openURL,
} from "@/lib/utils/url-utils";
import {
  isValidOptionalGitHubURL,
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
  FormDropdown,
  FormInput,
} from "@/components/EditForm";
import { Divider } from "@/components/ui/divider";
import Link from "next/link";
import {
  isValidOptionalUserName,
  isValidRequiredUserName,
} from "@/lib/utils/name-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Autocomplete, AutocompleteMulti } from "@/components/ui/autocomplete";
import { isoToMs, msToISO } from "@/lib/utils/date-utils";
import {
  AutocompleteTreeMulti,
  type PositionCategory,
} from "@/components/ui/autocomplete";
import { POSITION_TREE } from "@/lib/consts/positions";

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
    if (searchParams.get("edit") === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  if (profile.isPending) return <Loader>Loading profile...</Loader>;

  if (profile.error) {
    return (
      <Card className="flex flex-col items-center justify-center max-w-md m-auto">
        <p className="text-red-600 mb-4 text-base sm:text-lg">
          Failed to load profile: {profile.error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  return (
    profile.data && (
      <>
        <div className="min-h-screen bg-transparent p-6 py-12 w-full">
          <div className="flex items-start gap-8 flex-1 w-full max-w-[600px] m-auto">
            <div className="relative flex-shrink-0">
              <MyUserPfp size="36" />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-[0.5em] right-[0.5em] h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                onClick={() => pfpFileInputRef.current?.open()}
                disabled={pfpIsUploading}
              >
                <Camera className="h-3 w-3" />
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

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold font-heading mb-1 line-clamp-1">
                {getFullName(profile.data)}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                <div>
                  <BoolBadge
                    state={profile.data.taking_for_credit}
                    onValue="Taking for credit"
                    offValue="Not taking for credit"
                  />
                </div>
              </p>
              <div className="flex w-full flex-row flex-wrap gap-2 flex-shrink-0 mt-10">
                <Button
                  variant="outline"
                  scheme="primary"
                  disabled={isEditing}
                  onClick={() => openEmployerModal()}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                {/* Edit Mode Buttons */}
                {isEditing ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSaveError(null);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setSaving(true);
                        setSaveError(null);
                        const success = await profileEditorRef.current?.save();
                        setSaving(false);
                        if (success) {
                          setIsEditing(false);
                        } else {
                          setSaveError(
                            "Please fix the errors in the form before saving."
                          );
                        }
                      }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditing && saveError && (
                <p className="text-red-600 text-sm mt-4 mb-2 text-left">
                  {saveError}
                </p>
              )}
            </div>
          </div>

          <div className="w-full max-w-[600px] m-auto space-y-2 mt-8">
            {!isEditing && <ProfileDetails profile={profile.data} />}
            {isEditing && (
              <ProfileEditForm data={profile.data}>
                <ProfileEditor
                  updateProfile={profile.update}
                  ref={profileEditorRef}
                />
              </ProfileEditForm>
            )}
            <ResumeBox
              profile={profile.data}
              openResumeModal={openResumeModal}
            />
            <br />
            <br />
          </div>
        </div>

        {resumeURL.length > 0 && (
          <ResumeModal>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
              <PDFPreview url={resumeURL} />
            </div>
          </ResumeModal>
        )}

        <EmployerModal>
          <ApplicantModalContent
            applicant={profile.data}
            pfp_fetcher={() => UserService.getUserPfpURL("me")}
            pfp_route="/users/me/pic"
            open_resume={async () => {
              closeEmployerModal();
              await syncResumeURL();
              openResumeModal();
            }}
            open_calendar={async () => {
              openURL(profile.data?.calendar_link);
            }}
          />
        </EmployerModal>
      </>
    )
  );
}

const ProfileDetails = ({ profile }: { profile: PublicUser }) => {
  const { isMobile } = useAppContext();
  const {
    to_college_name,
    to_level_name,
    to_department_name,
    to_degree_full_name,
    to_university_name,
  } = useDbRefs();

  return (
    <>
      <Card className="bg-white p-3 px-5 overflow-hidden text-wrap">
        <p className="text-sm leading-relaxed">
          {profile.bio || (
            <span className="text-muted-foreground italic">
              No bio provided. Click "Edit" to add information about yourself.
            </span>
          )}
        </p>
      </Card>

      <Card className="px-5">
        <div
          className={cn(
            isMobile
              ? "grid grid-cols-1 space-y-5 mb-8"
              : "grid grid-cols-2 gap-y-5"
          )}
        >
          <LabeledProperty
            label="Full Name"
            value={`${toSafeString(profile.first_name)} ${toSafeString(
              profile.middle_name
            )} ${toSafeString(profile.last_name)}`}
          />

          <LabeledProperty label="Phone Number" value={profile.phone_number} />

          <LabeledProperty
            label="Year Level"
            value={to_level_name(profile.year_level)}
          />

          <LabeledProperty
            label="Education"
            value={`${to_university_name(profile.university)}\n
              ${to_college_name(profile.college)}\n
              ${to_department_name(profile.department)}\n
              ${to_degree_full_name(profile.degree)}`}
          />
        </div>
        <Divider />
        <div
          className={cn(
            "mb-8",
            isMobile
              ? "grid grid-cols-1 space-y-2"
              : "flex flex-row space-x-2 items-center justify-start"
          )}
        >
          <ProfileLinkBadge
            title="Portfolio Link"
            link={profile.portfolio_link}
          />
          <ProfileLinkBadge title="Github Profile" link={profile.github_link} />
          <ProfileLinkBadge
            title="Linkedin Profile"
            link={profile.linkedin_link}
          />
          <ProfileLinkBadge
            title="Calendar Link"
            link={profile.calendar_link}
          />
        </div>
      </Card>
      <br />
    </>
  );
};

const ProfileEditor = forwardRef<
  { save: () => Promise<boolean> },
  { updateProfile: (updatedProfile: Partial<PublicUser>) => void }
>(({ updateProfile }, ref) => {
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
    get_job_mode,
    get_job_type,
    get_job_category,
  } = useDbRefs();

  // Provide an external link to save profile
  useImperativeHandle(ref, () => ({
    save: async () => {
      await validateFormData();
      const hasErrors = Object.values(formErrors).some((err) => !!err);
      if (hasErrors) {
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

  // Dropdown options
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

  // Update dropdown options
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

    const debouncedValidation = setTimeout(() => validateFormData(), 500);
    return () => clearTimeout(debouncedValidation);
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

  // Data validators
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
        !isValidOptionalGitHubURL(link) && "Invalid github link."
    );
    addValidator(
      "linkedin_link",
      (link: string) =>
        !isValidOptionalLinkedinURL(link) && "Invalid linkedin link."
    );
    // ! uncomment when calendar back
    // addValidator(
    //   "calendar_link",
    //   (link: string) =>
    //     !isValidOptionalCalendarURL(link) && "Invalid calendar link."
    // );

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
    jobCategoryOptions,
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
      ) {
        return;
      }
      setShowCalendarHelp(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCalendarHelp]);

  return (
    <>
      <Card className="flex flex-col gap-5">
        {/* Identity Section */}
        <div>
          <div className="text-2xl tracking-tight font-medium text-gray-700">
            Identity
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.first_name} />
            <ErrorLabel value={formErrors.middle_name} />
            <ErrorLabel value={formErrors.last_name} />
          </div>
          <div
            className={cn(
              "mb-4",
              isMobile ? "flex flex-col space-y-3" : "flex flex-row space-x-2"
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
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.phone_number} />
          </div>
          <div className="mb-2">
            <FormInput
              label="Phone Number"
              value={formData.phone_number ?? ""}
              setter={fieldSetter("phone_number")}
            />
          </div>
        </div>

        {/* Personal Bio */}
        <div>
          <div className="text-2xl tracking-tight font-medium text-gray-700 mb-2">
            Personal Bio
          </div>
          <textarea
            value={formData.bio || ""}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder="Tell us about yourself, your interests, goals, and what makes you unique..."
            className="w-full border border-gray-200 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.bio || "").length}/500 characters
          </p>
        </div>

        {/* Educational Background */}
        <div>
          <div className="text-2xl tracking-tight font-medium text-gray-700 mb-2">
            Educational Background
          </div>
          <div className="flex flex-col space-y-3 w-full ">
            <div>
              <div className="text-xs text-gray-400 italic mb-1 block">
                University
              </div>
              <ErrorLabel value={formErrors.university} />
              <Autocomplete
                options={universityOptions}
                value={formData.university}
                setter={fieldSetter("university")}
                placeholder="Select University"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 italic mb-1 block">
                College
              </div>
              <ErrorLabel value={formErrors.college} />
              <Autocomplete
                options={collegeOptions}
                value={formData.college}
                setter={fieldSetter("college")}
                placeholder="Select College"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 italic mb-1 block">
                Department
              </div>
              <ErrorLabel value={formErrors.department} />
              <Autocomplete
                options={departmentOptions}
                value={formData.department}
                setter={fieldSetter("department")}
                placeholder="Select Department"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 italic mb-1 block">
                Degree
              </div>
              <ErrorLabel value={formErrors.degree} />
              <Autocomplete
                options={degreeOptions}
                value={formData.degree}
                setter={fieldSetter("degree")}
                placeholder="Select Degree"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 italic mb-1 block">
                Year Level
              </div>
              <ErrorLabel value={formErrors.year_level} />
              <Autocomplete
                options={levels}
                value={formData.year_level}
                setter={fieldSetter("year_level")}
                placeholder="Select Year Level"
              />
            </div>
            <FormInput
              label={"Major/Minor degree"}
              value={formData.degree_notes ?? ""}
              setter={fieldSetter("degree_notes")}
              maxLength={100}
              required={false}
            />
          </div>
        </div>

        {/* Internship Details */}
        <div className="flex flex-col space-y-2 gap-1">
          <div className="text-2xl tracking-tight font-medium text-gray-700">
            Internship Details
          </div>
          <div className="flex flex-row items-center justify-start mt-8 my-2">
            <FormCheckbox
              checked={formData.taking_for_credit}
              setter={fieldSetter("taking_for_credit")}
            />
            <div className="text-sm text-gray-500 ml-3">
              Taking internships for credit?
            </div>
          </div>
          {formData.taking_for_credit && (
            <FormInput
              label={"Linkage Officer"}
              value={formData.linkage_officer ?? ""}
              setter={fieldSetter("linkage_officer")}
              required={false}
            />
          )}

          <div className="flex flex-row gap-6">
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
            label="Expected Duration (in hours)"
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
        </div>

        {/* Internship Preferences */}
        <div>
          <div className="text-2xl tracking-tight font-medium text-gray-700">
            Internship Preferences
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-400 italic mb-1 block">
              Work Modes
            </div>
            <AutocompleteMulti
              options={jobModeOptions}
              value={formData.job_mode_ids ?? []}
              setter={fieldSetter("job_mode_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_mode_ids} />
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-400 italic mb-1 block">
              Workload Types
            </div>
            <AutocompleteMulti
              options={jobTypeOptions}
              value={formData.job_type_ids ?? []}
              setter={fieldSetter("job_type_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_type_ids} />
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-400 italic mb-1 block">
              Positions / Categories
            </div>
            <AutocompleteTreeMulti
              tree={POSITION_TREE}
              value={formData.job_category_ids ?? []}
              setter={fieldSetter("job_category_ids")}
              placeholder="Select one or more"
            />
            <ErrorLabel value={formErrors.job_category_ids} />
          </div>
        </div>

        {/* External Profiles */}
        <div>
          <div className="text-2xl tracking-tight font-medium text-gray-700">
            External Profiles
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.portfolio_link} />
            <ErrorLabel value={formErrors.github_link} />
            <ErrorLabel value={formErrors.linkedin_link} />
            {/* // ! uncomment when calendar back */}
            {/* <ErrorLabel value={formErrors.calendar_link} /> */}
          </div>
          <div className="flex flex-col space-y-3">
            <FormInput
              label={"Portfolio Link"}
              value={formData.portfolio_link ?? ""}
              setter={fieldSetter("portfolio_link")}
              required={false}
            />
            <FormInput
              label={"Github Profile"}
              value={formData.github_link ?? ""}
              setter={fieldSetter("github_link")}
              required={false}
            />
            <FormInput
              label={"Linkedin Profile"}
              value={formData.linkedin_link ?? ""}
              setter={fieldSetter("linkedin_link")}
              required={false}
            />
            {/* // ! uncomment when calendar back */}
            {/* <div className="relative flex flex-col">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Calendar Link <span className="text-red-500">*</span>
              </span>
              <button
                type="button"
                ref={helpBtnRef}
                className="ml-2 opacity-70 hover:opacity-90"
                onClick={() => setShowCalendarHelp((v) => !v)}
                tabIndex={-1}
              >
                <MessageCircleQuestion className="w-4 h-4 text-blue-500" />
              </button>
            </div>
            <FormInput
              label={undefined}
              value={formData.calendar_link ?? ""}
              setter={fieldSetter("calendar_link")}
            />
            {showCalendarHelp && (
              <div
                ref={helpPopupRef}
                className="absolute left-0 top-full mt-2 w-full bg-gray-100 border border-gray-300 rounded p-3 text-xs text-gray-700 shadow z-10"
              >
                Go to <b>calendar.google.com</b>, press the <b>+</b> icon, and
                set up an appointment schedule to get this link.
                <br />
                <br />
                If you need help, you can head to{" "}
                <a
                  href="https://www.canva.com/design/DAGrKQdRG-8/XDGzebwKdB4CMWLOszcheg/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  this link
                </a>
                .
              </div>
            )}
          </div> */}
          </div>
        </div>
      </Card>
      <br />
      <br />
    </>
  );
});

const ResumeBox = ({
  profile,
  openResumeModal,
}: {
  profile: PublicUser;
  openResumeModal: () => void;
}) => {
  // File upload handlers
  const queryClient = useQueryClient();
  const {
    fileInputRef: resumeFileInputRef,
    upload: resumeUpload,
    isUploading: resumeIsUploading,
  } = useFileUpload({
    uploader: UserService.updateMyResume,
    filename: "resume",
  });

  return (
    <Card>
      <div className="flex flex-col items-center justify-center space-y-2">
        <BoolBadge
          state={!!profile.resume}
          onValue="Resume Uploaded"
          offValue="No Resume"
        />
        <Button
          onClick={() => resumeFileInputRef.current?.open()}
          disabled={resumeIsUploading}
        >
          <Upload className="h-4 w-4" />
          {resumeIsUploading
            ? "Uploading..."
            : !!profile.resume
            ? "Upload New"
            : "Upload"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">PDF up to 2.5MB</p>
      </div>
      <FileUploadInput
        ref={resumeFileInputRef}
        maxSize={2.5}
        allowedTypes={["application/pdf"]}
        onSelect={(file) => (
          resumeUpload(file),
          queryClient.invalidateQueries({ queryKey: ["my-profile"] })
        )}
      />
    </Card>
  );
};

const ProfileLinkBadge = ({
  title,
  link,
}: {
  title: string;
  link?: string | null;
}) => {
  return (
    <Button
      variant="ghost"
      className="p-0 h-6 w-fit"
      disabled={!link}
      onClick={() => openURL(link)}
    >
      <BoolBadge state={!!link} onValue={title} offValue={title} />
    </Button>
  );
};
