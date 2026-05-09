"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { BriefcaseBusiness, FileText, UserRound } from "lucide-react";

import {
  createEditForm,
  FormInput,
  FormMonthPicker,
} from "@/components/EditForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Autocomplete, AutocompleteMulti } from "@/components/ui/autocomplete";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import {
  SingleChipSelect,
  type Option as ChipOpt,
} from "@/components/ui/chip-select";
import { ErrorLabel } from "@/components/ui/labels";
import { POSITION_TREE } from "@/lib/consts/positions";
import { useDbRefs } from "@/lib/db/use-refs";
import { InternshipPreferences, PublicUser } from "@/lib/db/db.types";
import { isValidPHNumber } from "@/lib/utils";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import {
  isValidOptionalGitHubURL,
  isValidOptionalLinkedinURL,
  isValidOptionalURL,
  toURL,
} from "@/lib/utils/url-utils";
import { sortUniversityOptions } from "@/lib/student-forms-access";
import { DEGREES } from "@/app/student/register/steps/tempDegrees";
import { ResumeSection } from "./ResumeSection";
import type { ProfileResumeManager, ProfileSectionKey } from "./profile-types";

export const [ProfileEditForm, useProfileEditForm] =
  createEditForm<PublicUser>();

export type EditableProfileTabKey = "Student Profile" | "Internship Details";
type EditSectionKey = ProfileSectionKey;

export const ProfileEditor = forwardRef<
  { save: () => Promise<boolean> },
  {
    updateProfile: (updatedProfile: Partial<PublicUser>) => Promise<unknown>;
    initialTab: EditableProfileTabKey;
    initialOpenSections?: ProfileSectionKey[];
    actionSlot?: ReactNode;
    resumeManager: ProfileResumeManager;
  }
>(
  (
    {
      updateProfile,
      initialTab,
      initialOpenSections,
      actionSlot,
      resumeManager,
    },
    ref,
  ) => {
    const {
      formData,
      formErrors,
      setField,
      fieldSetter,
      addValidator,
      validateFormData,
      cleanFormData,
    } = useProfileEditForm();
    const { universities, job_modes, job_types, job_categories } = useDbRefs();
    const initialSection: EditSectionKey =
      initialTab === "Internship Details" ? "internship" : "personal";
    const [openSections, setOpenSections] = useState<EditSectionKey[]>(
      initialOpenSections?.length
        ? initialOpenSections
        : ["resume", initialSection],
    );
    const openEditorSection = (section: EditSectionKey) => {
      setOpenSections((current) =>
        current.includes(section) ? current : [...current, section],
      );
    };

    const hasProfileErrors = !!(
      formErrors.first_name ||
      formErrors.last_name ||
      formErrors.phone_number ||
      formErrors.university
    );
    const hasPrefsErrors = !!formErrors.internship_preferences;
    const fieldErrorClassName = "mt-1 mb-0 mx-0";
    const internshipPreferencesError = formErrors.internship_preferences ?? "";
    const internshipStartError = internshipPreferencesError.includes(
      "expected start month",
    )
      ? internshipPreferencesError
      : null;
    const internshipDurationError = internshipPreferencesError.includes(
      "number of hours",
    )
      ? internshipPreferencesError
      : null;
    const internshipSetupError = internshipPreferencesError.includes(
      "work setup",
    )
      ? internshipPreferencesError
      : null;
    const internshipCommitmentError = internshipPreferencesError.includes(
      "work commitment",
    )
      ? internshipPreferencesError
      : null;
    const internshipCategoryError = internshipPreferencesError.includes(
      "work category",
    )
      ? internshipPreferencesError
      : null;

    useImperativeHandle(ref, () => ({
      save: async () => {
        const isValid = validateFormData();
        if (!isValid) {
          if (hasPrefsErrors) openEditorSection("internship");
          else openEditorSection("personal");
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
        await updateProfile(updatedProfile);
        return true;
      },
    }));

    const [universityOptions, setUniversityOptions] = useState(universities);
    const [jobModeOptions, setJobModeOptions] = useState(job_modes);
    const [jobTypeOptions, setJobTypeOptions] = useState(job_types);
    const [jobCategoryOptions, setJobCategoryOptions] =
      useState(job_categories);
    const creditOptions: ChipOpt[] = [
      { value: "credit", label: "Credited" },
      { value: "voluntary", label: "Voluntary" },
    ];

    useEffect(() => {
      setUniversityOptions(universities);
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
        (link: string) =>
          !isValidOptionalURL(link) && "Invalid portfolio link.",
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
        if (!i.expected_start_date)
          return "Please select an expected start month.";

        if (
          i?.internship_type === "credited" &&
          i.expected_duration_hours != null
        ) {
          if (
            !Number.isFinite(i.expected_duration_hours) ||
            i.expected_duration_hours < 100 ||
            i.expected_duration_hours > 2000
          )
            return "Enter a valid number of hours (100-2000)";
        }

        if (i.job_setup_ids) {
          const valid = new Set(jobModeOptions.map((o) => o.id.toString()));
          if (!i.job_setup_ids.every((v) => valid.has(v)))
            return "Invalid work setup selected.";
        }

        if (i.job_commitment_ids) {
          const valid = new Set(jobTypeOptions.map((o) => o.id.toString()));
          if (!i.job_commitment_ids.every((v) => valid.has(v)))
            return "Invalid work commitment selected.";
        }

        if (i.job_category_ids) {
          const valid = new Set(jobCategoryOptions.map((o) => o.id.toString()));
          if (!i.job_category_ids.every((v) => valid.has(v)))
            return "Invalid work category selected.";
        }

        return false;
      });
    }, [universityOptions, jobModeOptions, jobTypeOptions, jobCategoryOptions]);

    const didInitNormalize = useRef(false);
    useEffect(() => {
      if (didInitNormalize.current) return;
      didInitNormalize.current = true;

      const current = formData.internship_preferences?.expected_start_date;
      let next = current;

      if (!next) next = getNearestMonthTimestamp();
      if (next && next !== current) {
        setField("internship_preferences", {
          ...formData.internship_preferences,
          expected_start_date: next,
        });
      }
    }, []);

    return (
      <div className="flex flex-col gap-3">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(value) => setOpenSections(value as EditSectionKey[])}
          className="overflow-hidden rounded-[0.33em] border border-blue-100 bg-white shadow-sm"
        >
          <EditAccordionItem
            value="resume"
            icon={<FileText className="h-5 w-5" />}
            title="Resume"
          >
            <ResumeSection manager={resumeManager} />
          </EditAccordionItem>

          <EditAccordionItem
            value="internship"
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="Internship Details"
            hasError={hasPrefsErrors}
          >
            <div className="space-y-6">
              <section className="flex flex-col gap-3">
                <EditFieldRow label="Type of internship">
                  <SingleChipSelect
                    className="justify-start"
                    value={
                      formData.internship_preferences?.internship_type ===
                      "credited"
                        ? "credit"
                        : "voluntary"
                    }
                    onChange={(v) =>
                      setField("internship_preferences", {
                        ...(formData.internship_preferences ?? {}),
                        internship_type:
                          v === "credit" ? "credited" : "voluntary",
                      })
                    }
                    options={creditOptions}
                  />
                </EditFieldRow>

                <EditFieldRow label="Ideal internship start">
                  <FormMonthPicker
                    className="w-full"
                    date={
                      formData.internship_preferences?.expected_start_date ?? 0
                    }
                    setter={(ms?: number) => {
                      setField("internship_preferences", {
                        ...(formData.internship_preferences ?? {}),
                        expected_start_date: ms ?? null,
                      });
                    }}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 4}
                    required={false}
                    placeholder="Select month"
                  />
                  <ErrorLabel
                    value={internshipStartError}
                    className={fieldErrorClassName}
                  />
                </EditFieldRow>

                {formData.internship_preferences?.internship_type ===
                  "credited" && (
                  <EditFieldRow label="Expected Duration (hours)">
                    <FormInput
                      inputMode="numeric"
                      value={
                        formData.internship_preferences
                          ?.expected_duration_hours ?? ""
                      }
                      setter={(v: string) =>
                        setField("internship_preferences", {
                          ...(formData.internship_preferences ?? {}),
                          expected_duration_hours:
                            v.trim() === "" ? null : Number(v),
                        })
                      }
                      required={false}
                    />
                    <ErrorLabel
                      value={internshipDurationError}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                )}
              </section>

              <section>
                <div className="mt-3 space-y-3">
                  <EditFieldRow label="Work Modes">
                    <AutocompleteMulti
                      options={jobModeOptions}
                      value={(
                        formData.internship_preferences?.job_setup_ids ?? []
                      ).map(Number)}
                      setter={(ids: number[]) =>
                        setField("internship_preferences", {
                          ...(formData.internship_preferences ?? {}),
                          job_setup_ids: ids.map(String),
                        })
                      }
                      placeholder="Select one or more"
                    />
                    <ErrorLabel
                      value={internshipSetupError}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>

                  <EditFieldRow label="Workload Types">
                    <AutocompleteMulti
                      options={jobTypeOptions}
                      value={(
                        formData.internship_preferences?.job_commitment_ids ??
                        []
                      ).map(Number)}
                      setter={(ids: number[]) =>
                        setField("internship_preferences", {
                          ...(formData.internship_preferences ?? {}),
                          job_commitment_ids: ids.map(String),
                        })
                      }
                      placeholder="Select one or more"
                    />
                    <ErrorLabel
                      value={internshipCommitmentError}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>

                  <EditFieldRow label="Positions / Categories">
                    <AutocompleteTreeMulti
                      tree={POSITION_TREE}
                      value={
                        formData.internship_preferences?.job_category_ids ?? []
                      }
                      setter={(ids: string[]) =>
                        setField("internship_preferences", {
                          ...(formData.internship_preferences ?? {}),
                          job_category_ids: ids,
                        })
                      }
                      placeholder="Select one or more"
                    />
                    <ErrorLabel
                      value={internshipCategoryError}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                </div>
              </section>
            </div>
          </EditAccordionItem>

          <EditAccordionItem
            value="personal"
            icon={<UserRound className="h-5 w-5" />}
            title="Personal Information"
            hasError={hasProfileErrors}
          >
            <div className="space-y-6">
              <section>
                <div className="text-base font-semibold text-[#061858]">
                  Identity
                </div>
                <div className="mt-3 space-y-3">
                  <EditFieldRow label="First Name">
                    <FormInput
                      value={formData.first_name ?? ""}
                      setter={fieldSetter("first_name")}
                      maxLength={32}
                    />
                    <ErrorLabel
                      value={formErrors.first_name}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                  <EditFieldRow label="Last Name">
                    <FormInput
                      value={formData.last_name ?? ""}
                      setter={fieldSetter("last_name")}
                    />
                    <ErrorLabel
                      value={formErrors.last_name}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                </div>
                <EditFieldRow label="Phone Number" className="mt-3">
                  <FormInput
                    value={formData.phone_number ?? ""}
                    setter={fieldSetter("phone_number")}
                    required={false}
                  />
                  <ErrorLabel
                    value={formErrors.phone_number}
                    className={fieldErrorClassName}
                  />
                </EditFieldRow>
              </section>

              <section>
                <div className="text-base font-semibold text-[#061858]">
                  Education
                </div>
                <div className="mt-3 flex flex-col space-y-3">
                  <EditFieldRow label="University">
                    <Autocomplete
                      options={sortUniversityOptions(universityOptions)}
                      value={formData.university}
                      setter={fieldSetter("university")}
                      placeholder="Select University"
                      preserveOptionOrder
                    />
                    <ErrorLabel
                      value={formErrors.university}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                  <EditFieldRow label="Degree / Program">
                    <Autocomplete
                      options={DEGREES}
                      value={formData.degree ?? ""}
                      setter={(val) =>
                        setField("degree", val === null ? "" : String(val))
                      }
                      placeholder="Indicate degree"
                      required={false}
                      allowCustomValue={true}
                      emptyText="type your own degree..."
                    />
                  </EditFieldRow>
                  <EditFieldRow label="Expected Graduation Date">
                    <FormMonthPicker
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
                    <ErrorLabel
                      value={formErrors.expected_graduation_date}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                </div>
              </section>

              <section>
                <div className="text-base font-semibold text-[#061858]">
                  External Profiles
                </div>
                <div className="mt-3 flex flex-col space-y-3">
                  <EditFieldRow label="Portfolio Link">
                    <FormInput
                      value={formData.portfolio_link ?? ""}
                      setter={fieldSetter("portfolio_link")}
                      required={false}
                    />
                    <ErrorLabel
                      value={formErrors.portfolio_link}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                  <EditFieldRow label="GitHub Profile">
                    <FormInput
                      value={formData.github_link ?? ""}
                      setter={fieldSetter("github_link")}
                      required={false}
                    />
                    <ErrorLabel
                      value={formErrors.github_link}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                  <EditFieldRow label="LinkedIn Profile">
                    <FormInput
                      value={formData.linkedin_link ?? ""}
                      setter={fieldSetter("linkedin_link")}
                      required={false}
                    />
                    <ErrorLabel
                      value={formErrors.linkedin_link}
                      className={fieldErrorClassName}
                    />
                  </EditFieldRow>
                </div>
              </section>
            </div>
          </EditAccordionItem>
        </Accordion>
        {actionSlot && (
          <div className="flex justify-end border-red-500">{actionSlot}</div>
        )}
      </div>
    );
  },
);
ProfileEditor.displayName = "ProfileEditor";

function EditAccordionItem({
  value,
  icon,
  title,
  hasError,
  children,
}: {
  value: EditSectionKey;
  icon: ReactNode;
  title: string;
  hasError?: boolean;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-blue-100">
      <AccordionTrigger className="px-4 py-4 text-[#061858] hover:no-underline sm:px-5">
        <span className="flex items-center gap-3 text-base font-semibold">
          <span className="text-primary">{icon}</span>
          {title}
          {hasError && <span className="h-2 w-2 rounded-full bg-destructive" />}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-5 sm:px-5">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function EditFieldRow({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-1 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8 ${className}`}
    >
      <div className="pt-1 text-xs font-medium text-slate-500">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const getNearestMonthTimestamp = () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${(
    "0" + (date.getMonth() + 1).toString()
  ).slice(-2)}-01T00:00:00.000Z`;
  return Date.parse(dateString);
};
