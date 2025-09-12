/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-19 04:14:35
 * @ Modified time: 2025-08-26 12:35:52
 * @ Description:
 *
 * What employers see when clicking on an applicant to view.
 * Can also be previewed by applicants, that's why it's a shared component.
 */

"use client";

import { useCallback, useMemo } from "react";
import { Job, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { Button } from "../ui/button";
import {
  Award,
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
  SendHorizonal,
  Text,
} from "lucide-react";
import { getFullName } from "@/lib/utils/user-utils";
import { MyUserPfp, UserPfp } from "./pfp";
import { Divider } from "../ui/divider";
import { fmtISO } from "@/lib/utils/date-utils";

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.length ? (
      items.map((n, i) => (
        <span
          key={`${n}-${i}`}
          className="px-2 py-1 text-xs rounded-full bg-gray-100 border border-gray-300"
        >
          {n}
        </span>
      ))
    ) : (
      <span className="font-medium text-gray-900 text-sm sm:text-base">
        Not provided
      </span>
    )}
  </div>
);

export const ApplicantModalContent = ({
  applicant = {} as Partial<PublicUser>,
  clickable = true,
  open_resume,
  open_calendar,
  is_employer = false,
  job = {} as Partial<Job>,
  // NEW (minimal): consume a presigned URL if parent provides it
  resume_url,
}: {
  applicant?: Partial<PublicUser>;
  clickable?: boolean;
  pfp_fetcher: () => Promise<{ hash?: string }>;
  pfp_route: string;
  open_resume: () => void;
  open_calendar: () => void;
  is_employer?: boolean;
  job?: Partial<Job>;
  resume_url?: string; // <— added
}) => {
  const {
    to_level_name,
    to_college_name,
    to_job_type_name,
    to_university_name,
    job_modes,
    job_types,
    job_categories,
    to_job_mode_name,
    to_job_category_name,
  } = useDbRefs();

  // Name mappers
  const modeName = (id: any) => to_job_mode_name(id);

  const typeName = (id: any) => to_job_type_name(id);

  const categoryName = (id: any) => to_job_category_name(id);

  const jobModeNames = useMemo(
    () => (applicant.job_mode_ids ?? []).map(modeName).filter(Boolean),
    [applicant.job_mode_ids, job_modes]
  );
  const jobTypeNames = useMemo(
    () => (applicant.job_type_ids ?? []).map(typeName).filter(Boolean),
    [applicant.job_type_ids, job_types]
  );
  const jobCategoryNames = useMemo(
    () => (applicant.job_category_ids ?? []).map(categoryName).filter(Boolean),
    [applicant.job_category_ids, job_categories]
  );

  // actions
  const handleResumeClick = useCallback(async () => {
    if (!clickable || !applicant?.resume || !applicant?.id) return;
    open_resume();
  }, [clickable, applicant?.resume, applicant?.id, open_resume]);

  // Handle calendar button click - memoize to prevent re-renders
  const handleCalendarClick = useCallback(() => {
    if (!clickable || !applicant?.calendar_link) return;
    open_calendar();
  }, [clickable, applicant?.calendar_link]);

  // use the presigned URL for embedding
  const resumeSrc = resume_url && resume_url.length ? resume_url : "";

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT: original content */}
      <div className="flex flex-col h-full min-h-0 max-h-[95vh] md:max-h-[85vh] border-r border-gray-100 bg-white">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 px-4 sm:px-6 md:px-8 lg:px-10 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex-shrink-0 self-center sm:self-start">
              {is_employer ? (
                <UserPfp user_id={applicant.id ?? ""} size="28" />
              ) : (
                <MyUserPfp size="28" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 sm:mb-2 md:mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Active
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3 leading-tight">
                {getFullName(applicant) === ""
                  ? "No Name"
                  : getFullName(applicant)}
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mb-2 sm:mb-3 md:mb-4">
                Applying for {job?.title ?? "Sample Position"}{" "}
                {job?.type !== undefined && job?.type !== null
                  ? `• ${to_job_type_name(job.type)}`
                  : ""}
              </p>

              {applicant.taking_for_credit && (
                <div className="flex justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 sm:gap-2 text-green-700 bg-green-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-2 rounded-full text-xs sm:text-sm font-medium">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    Taking for credit
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2 md:flex-row lg:hidden">
            <Button
              className="h-10 sm:h-11"
              size="md"
              disabled={!clickable || !applicant.resume}
              onClick={handleResumeClick}
            >
              <FileText className="h-4 w-4 mr-2" />
              {applicant.resume ? "View Resume" : "No Resume"}
            </Button>
            {/* // ! uncomment when calendar back */}
            {/* <Button
              variant="outline"
              className="h-10 sm:h-11"
              size="md"
              disabled={!clickable || !applicant?.calendar_link}
              onClick={handleCalendarClick}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {applicant?.calendar_link ? "Schedule" : "No Calendar"}
            </Button> */}
          </div>
        </div>

        {/* Scrollable Content Section - Optimized for small screens */}
        <div
          className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-6 pb-8 sm:pb-12"
          style={{ minHeight: "250px" }}
        >
          {/* Academic Background Card */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Academic Background
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Program
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {to_college_name(applicant?.college)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Institution
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {to_university_name(applicant?.university)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Year Level
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {to_level_name(applicant?.year_level)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Email
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                  {applicant?.email || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Contact & Professional Links
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Phone Number
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {applicant?.phone_number || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Portfolio
                </p>
                {applicant?.portfolio_link ? (
                  <a
                    href={applicant?.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      !clickable
                        ? { pointerEvents: "none", cursor: "default" }
                        : {}
                    }
                    className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                  >
                    View Portfolio
                  </a>
                ) : (
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    Not provided
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  GitHub
                </p>
                {applicant?.github_link ? (
                  <a
                    href={applicant?.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      !clickable
                        ? { pointerEvents: "none", cursor: "default" }
                        : {}
                    }
                    className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                  >
                    View GitHub
                  </a>
                ) : (
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    Not provided
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  LinkedIn
                </p>
                {applicant?.linkedin_link ? (
                  <a
                    href={applicant?.linkedin_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      !clickable
                        ? { pointerEvents: "none", cursor: "default" }
                        : {}
                    }
                    className="text-blue-600 hover:underline font-medium break-all text-sm sm:text-base"
                  >
                    View LinkedIn
                  </a>
                ) : (
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    Not provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Internship Preferences */}
          <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-4">
              Internship Preferences
            </h3>
            {/* Internship details */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Expected Start Date
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {fmtISO(applicant?.expected_start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Expected End Date
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {fmtISO(applicant?.expected_end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Expected Duration (hours)
                </p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {typeof applicant?.expected_duration_hours === "number"
                    ? `${applicant.expected_duration_hours}`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <Divider />
            </div>

            {/* --- Work preferences --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Work Modes
                </p>
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  <Chips items={jobModeNames} />
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Workload Types
                </p>
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  <Chips items={jobTypeNames} />
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Positions / Categories
                </p>
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  <Chips items={jobCategoryNames} />
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {applicant?.bio && applicant.bio.trim() && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                About the Candidate
              </h3>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {applicant.bio}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT (desktop): embed only presigned URL */}
      <div className="hidden lg:block h-full bg-gray-100">
        {resumeSrc ? (
          <iframe src={resumeSrc} title="Resume" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-gray-600 mb-3">No resume to display.</p>
              {/* The left-side “View Resume” still opens the signed modal */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
