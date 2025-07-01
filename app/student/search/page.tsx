"use client";

import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Heart,
  CheckCircle,
  Clipboard,
  AlertTriangle,
  User,
  Filter,
  Building,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useJobs,
  useSavedJobs,
  useProfile,
  useApplications,
} from "@/lib/api/use-api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Job } from "@/lib/db/db.types";
import { Paginator } from "@/components/ui/paginator";
import { useRefs } from "@/lib/db/use-refs";
import {
  DropdownGroup,
  GroupableRadioDropdown,
} from "@/components/ui/dropdown";
import { useFilter } from "@/lib/filter";
import { useAppContext } from "@/lib/ctx-app";
import { useModal } from "@/hooks/use-modal";
import {
  JobApplicationRequirements,
  JobBadges,
  JobCard,
  JobDetails,
  MobileJobCard,
} from "@/components/shared/jobs";
import { cn, formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import {
  getMissingProfileFields,
  isCompleteProfile,
} from "@/lib/utils/user-utils";
import { UserService } from "@/lib/api/api";
import { useFile } from "@/hooks/use-file";
import { useClientDimensions } from "@/hooks/use-dimensions";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { openURL } from "@/lib/utils/url-utils";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated: is_authenticated } = useAuthContext();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const textarea_ref = useRef<HTMLTextAreaElement>(null);
  const [showCoverLetterInput, setShowCoverLetterInput] = useState(false);

  // Initialize filters with URL synchronization and proper defaults
  const { filters, filter_setter, clear_filters } = useFilter<{
    job_type: string;
    location: string;
    industry: string;
    category: string;
  }>(
    {
      job_type: searchParams.get("jobType") || "All types",
      location: searchParams.get("location") || "Any work load type",
      industry: searchParams.get("industry") || "All industries",
      category: searchParams.get("category") || "All categories",
    },
    true
  ); // Enable URL synchronization

  const {
    open: openSuccessModal,
    close: closeSuccessModal,
    Modal: SuccessModal,
  } = useModal("success-modal");
  const {
    open: openFilterModal,
    close: closeFilterModal,
    Modal: FilterModal,
  } = useModal("filter-modal");
  const {
    open: openJobModal,
    close: closeJobModal,
    Modal: JobModal,
  } = useModal("job-modal", { showCloseButton: false });
  const {
    open: openApplicationConfirmationModal,
    close: closeApplicationConfirmationModal,
    Modal: ApplicationConfirmationModal,
  } = useModal("application-confirmation-modal");
  const {
    open: openProfilePreviewModal,
    close: closeProfilePreviewModal,
    Modal: ProfilePreviewModal,
  } = useModal("profile-preview-modal");
  const {
    open: openIncompleteProfileModal,
    close: closeIncompleteProfileModal,
    Modal: IncompleteProfileModal,
  } = useModal("incomplete-profile-modal");

  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");

  const { isMobile: is_mobile } = useAppContext();
  const { profile } = useProfile();
  const { clientWidth: client_width, clientHeight: client_height } =
    useClientDimensions();

  // Resume URL management for profile preview
  const { url: resumeUrl, sync: syncResumeUrl } = useFile({
    fetcher: UserService.get_my_resume_url,
    route: "/users/me/resume",
  });
  const { industries, universities, job_categories } = useRefs();

  // API hooks with dynamic filtering based on current filter state
  const jobs_page_size = 10;
  const [jobs_page, setJobsPage] = useState(1);
  const {
    getJobsPage,
    jobs: filteredJobs,
    loading: jobs_loading,
    error: jobs_error,
    refetch,
  } = useJobs({
    search: searchTerm.trim() || undefined,
    category: filters.category,
    mode: filters.location,
    industry: filters.industry,
  });

  // Get paginated jobs directly from getJobsPage
  const jobs = getJobsPage({ page: jobs_page, limit: jobs_page_size });

  const { is_saved, saving, save_job } = useSavedJobs();
  const { appliedJob, apply } = useApplications();

  // Initialize search term from URL
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchTerm(query);
  }, [searchParams]);

  // Reset to page 1 when filters or search term change
  useEffect(() => {
    setJobsPage(1);
  }, [
    searchTerm,
    filters.job_type,
    filters.location,
    filters.industry,
    filters.category,
  ]);

  // Set first job as selected when jobs load
  useEffect(() => {
    const jobId = searchParams.get("jobId");

    if (jobId && jobs.length > 0) {
      const targetJob = jobs.find((job) => job.id === jobId);
      if (targetJob && targetJob.id !== selectedJob?.id) {
        setSelectedJob(targetJob);
      }
    } else if (jobs.length > 0 && !selectedJob?.id) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs.length, searchParams]);

  const handleSave = async (job: Job) => {
    if (!is_authenticated()) {
      window.location.href = "/login";
      return;
    }

    try {
      await save_job(job.id ?? "");
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleApply = () => {
    console.log("handleApply called");

    if (!is_authenticated()) {
      console.log("Not authenticated, redirecting to login");
      window.location.href = "/login";
      return;
    }

    // Check if already applied
    const applicationStatus = appliedJob(selectedJob?.id ?? "");
    if (applicationStatus) {
      console.log("Already applied to this job");
      alert("You have already applied to this job!");
      return;
    }

    // Check if profile is complete
    const profileComplete = isCompleteProfile(profile);

    // Check if requirements are met
    if (
      selectedJob?.require_github &&
      (!profile?.github_link || profile.github_link === "")
    ) {
      alert("This job requires a github link, but you don't have one yet!");
      return;
    }

    if (
      selectedJob?.require_portfolio &&
      (!profile?.portfolio_link || profile.portfolio_link === "")
    ) {
      alert("This job requires a portfolio link, but you don't have one yet!");
      return;
    }

    if (!profileComplete) {
      console.log("Profile not complete, opening incomplete profile modal");
      openIncompleteProfileModal();
      return;
    }

    // If profile is complete, show confirmation modal
    console.log("Opening application confirmation modal");
    openApplicationConfirmationModal();
  };

  const handleDirectApplication = async () => {
    if (!selectedJob) return;

    if (
      selectedJob?.require_cover_letter &&
      !textarea_ref.current?.value.trim()
    ) {
      alert("A cover letter is required to apply for this job.");
      return;
    }

    try {
      const { success } = await apply(
        selectedJob.id ?? "",
        textarea_ref.current?.value ?? ""
      );
      if (success) openSuccessModal();
      else alert("Could not apply to job.");
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Reset to page 1 and trigger re-filter with current search term
      setJobsPage(1);
      // The useJobs hook will automatically re-filter based on the searchTerm
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setJobsPage(1); // Reset to first page when search changes
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJob(job);
    if (is_mobile) openJobModal();
  };

  if (jobs_error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load jobs: {jobs_error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop and Mobile Layout */}
      <div className="flex-1 flex overflow-hidden max-h-full">
        {jobs_loading ? (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : is_mobile ? (
          <div className="w-full flex flex-col h-full">
            {/* Fixed Mobile Search Bar */}
            <div className="bg-white border-b border-gray-100 p-6 flex-shrink-0">
              <div className="bg-white rounded-md border border-gray-200 p-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search Job Listings"
                      className="w-full h-12 pl-12 pr-4 bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-500 text-base"
                    />
                  </div>
                  <Button onClick={() => openFilterModal()} size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Job Cards Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {jobs.length ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <MobileJobCard
                      key={job.id}
                      job={job}
                      on_click={() => handleJobCardClick(job)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              {/* Mobile Paginator */}
              <div className="mt-6">
                <Paginator
                  totalItems={filteredJobs.length}
                  itemsPerPage={jobs_page_size}
                  onPageChange={(page) => setJobsPage(page)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout - Split View */
          <>
            {/* Job List */}
            <div className="w-1/3 border-r overflow-x-hidden overflow-y-auto p-6">
              {/* Desktop Search Bar */}
              <div className="w-full max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-md border border-gray-200 p-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search Job Listings"
                        className="w-full h-12 pl-12 pr-4 bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-500 text-base"
                      />
                    </div>
                    <Button onClick={() => openFilterModal()} size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {jobs.length ? (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={selectedJob?.id === job.id}
                      on_click={() => handleJobCardClick(job)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              {/* Desktop Paginator */}
              <Paginator
                totalItems={filteredJobs.length}
                itemsPerPage={jobs_page_size}
                onPageChange={(page) => setJobsPage(page)}
              />
            </div>

            {/* Job Details */}
            <div className="w-2/3 flex flex-col overflow-hidden">
              {selectedJob?.id ? (
                <JobDetails
                  job={selectedJob}
                  actions={[
                    <Button
                      key="1"
                      disabled={appliedJob(selectedJob.id ?? "")}
                      scheme={
                        appliedJob(selectedJob.id ?? "")
                          ? "supportive"
                          : "primary"
                      }
                      onClick={handleApply}
                    >
                      {appliedJob(selectedJob.id ?? "") && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {appliedJob(selectedJob.id ?? "") ? "Applied" : "Apply"}
                    </Button>,
                    <Button
                      key="2"
                      variant="outline"
                      onClick={() => handleSave(selectedJob)}
                      scheme={
                        is_saved(selectedJob.id) ? "destructive" : "default"
                      }
                    >
                      {is_saved(selectedJob.id ?? "") && <Heart />}
                      {is_saved(selectedJob.id ?? "")
                        ? "Saved"
                        : saving
                        ? "Saving..."
                        : "Save"}
                    </Button>,
                  ]}
                />
              ) : (
                <div className="h-full m-auto">
                  <div className="flex flex-col items-center pt-[25vh] h-screen">
                    <div className="opacity-35 mb-10">
                      <div className="flex flex-row justify-center w-full">
                        <h1 className="block text-6xl font-heading font-bold ">
                          BetterInternship
                        </h1>
                      </div>
                      <br />
                      <div className="flex flex-row justify-center w-full">
                        <p className="block text-2xl">
                          Better Internships Start Here
                        </p>
                      </div>
                    </div>
                    <div className="w-prose text-center border border-blue-500 border-opacity-50 text-blue-500 shadow-sm rounded-md p-4 bg-white">
                      Click on a job listing to view more details!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Job Details Modal */}
      <JobModal>
        <div className="h-full flex flex-col bg-white overflow-hidden">
          {/* Fixed Header with Close Button */}
          <div className="flex flex-col justify-start items-start p-4 border-b bg-white flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => closeJobModal()}
              className="h-8 w-8 p-0 ml-[-8px] mb-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            {/* Fixed Job Header - Non-scrollable */}
            {selectedJob && (
              <div className=" bg-white flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {selectedJob.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm">
                    {selectedJob.employer?.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Listed on {formatDate(selectedJob.created_at ?? "")}
                </p>
                <JobBadges job={selectedJob} />
              </div>
            )}
          </div>

          {/* Scrollable Content Area - MUST be properly configured */}
          <div
            className="flex-1 overflow-y-scroll overscroll-contain pb-32"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {selectedJob && (
              <div className="p-4">
                {/* Job Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3 text-gray-900">
                    Description
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
                    <ReactMarkdown>{selectedJob.description}</ReactMarkdown>
                  </div>
                </div>

                {/* Job Requirements */}
                {selectedJob.requirements && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-900">
                      Requirements
                    </h2>
                    <JobApplicationRequirements job={selectedJob} />
                    <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
                      <ReactMarkdown>{selectedJob.requirements}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Extra bottom padding to ensure content isn't hidden behind buttons */}
                <div className="pb-20"></div>
              </div>
            )}
          </div>

          {/* Fixed Action Buttons at Bottom - Always Visible and Prominent */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 p-4">
            <div className="flex gap-3">
              <Button
                disabled={appliedJob(selectedJob?.id ?? "")}
                onClick={handleApply}
                className={cn(
                  "flex-1 h-14 transition-all duration-300",
                  appliedJob(selectedJob?.id ?? "")
                    ? "bg-supportive text-white"
                    : "bg-primary  text-white"
                )}
              >
                {appliedJob(selectedJob?.id ?? "") ? "Applied" : "Apply Now"}
              </Button>

              <Button
                variant="outline"
                onClick={() => selectedJob && handleSave(selectedJob)}
                scheme={
                  is_saved(selectedJob?.id ?? "") ? "destructive" : "default"
                }
                className="h-14 w-14"
              >
                <Heart
                  className={cn(
                    "w-6 h-6",
                    is_saved(selectedJob?.id ?? "") ? "fill-current" : ""
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      </JobModal>

      {/* Success Modal */}
      <SuccessModal>
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 pb-0"></div>

        {/* Content */}
        <div className="px-6 pb-8 text-center">
          {/* Success Animation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: "spring",
                bounce: 0.5,
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Application Sent!
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Your application for{" "}
              <span className="font-semibold max-w-prose text-gray-800">
                {selectedJob?.title}
              </span>{" "}
              has been successfully submitted.
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Button
              onClick={() => {
                closeSuccessModal();
                router.push("/applications");
              }}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              View My Applications
            </Button>
          </motion.div>
        </div>
      </SuccessModal>

      {/* Filter Modal */}
      <FilterModal>
        <div className="space-y-3 px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Filter Jobs</h2>
          </div>
          <br />
          <DropdownGroup>
            <GroupableRadioDropdown
              name="location"
              options={["Any work load", "In-Person", "Remote", "Hybrid"]}
              on_change={filter_setter("location")}
              default_value={filters.location}
            />
            <GroupableRadioDropdown
              name="industry"
              options={[
                "All industries",
                ...industries.map((industry) => industry.name),
              ]}
              on_change={filter_setter("industry")}
              default_value={filters.industry}
            />
            <GroupableRadioDropdown
              name="category"
              options={[
                "All categories",
                ...job_categories
                  .toSorted((a, b) => a.order - b.order)
                  .map((c) => c.name),
              ]}
              on_change={filter_setter("category")}
              default_value={filters.category}
            />
          </DropdownGroup>

          <br />
          <div className="flex space-x-2">
            <Button
              onClick={() => closeFilterModal()}
              size="sm"
              className="transition-all duration-200"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clear_filters({
                  location: "Any location",
                  industry: "All industries",
                  category: "All categories",
                });
              }}
              className="transition-all duration-200"
            >
              Clear Filters
            </Button>
          </div>
          <br />
        </div>
      </FilterModal>

      {/* Application Confirmation Modal - Redesigned */}
      <ApplicationConfirmationModal>
        <div className="max-w-lg mx-auto p-6 max-h-[60vh] overflow-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Clipboard className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Apply?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You're applying for{" "}
              <span className="font-semibold text-gray-900">
                {selectedJob?.title}
              </span>
              {selectedJob?.employer?.name && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedJob.employer.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Profile Preview Section */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                closeApplicationConfirmationModal();
                openProfilePreviewModal();
              }}
              className="w-full h-12 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Preview Your Profile</span>
              </div>
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              See how employers will view your application
            </p>
          </div>

          {/* Cover Letter Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clipboard className="w-4 h-4 text-amber-600" />
                </div>
                <label
                  htmlFor="add-cover-letter"
                  className="font-medium text-gray-900"
                >
                  Cover Letter
                </label>
              </div>
              {!selectedJob?.require_cover_letter && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add-cover-letter"
                    checked={
                      showCoverLetterInput ||
                      (selectedJob?.require_cover_letter ?? false)
                    }
                    disabled={selectedJob?.require_cover_letter ?? false}
                    onChange={() =>
                      setShowCoverLetterInput(!showCoverLetterInput)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-500">Include</span>
                </div>
              )}
            </div>

            {(showCoverLetterInput ||
              (selectedJob?.require_cover_letter ?? false)) && (
              <div className="space-y-3">
                <Textarea
                  ref={textarea_ref}
                  placeholder="Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]"
                  className="w-full h-20 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm overflow-y-auto"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    💡 <span>Mention specific skills and enthusiasm</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                closeApplicationConfirmationModal();
                setShowCoverLetterInput(false);
              }}
              className="flex-1 h-12 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeApplicationConfirmationModal();
                handleDirectApplication();
                setShowCoverLetterInput(false);
              }}
              className="flex-1 h-12 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Submit Application
              </div>
            </Button>
          </div>
        </div>
      </ApplicationConfirmationModal>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            closeProfilePreviewModal();
            openApplicationConfirmationModal();
          }}
          className="h-8 w-8 p-0 ml-4 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Button>

        {profile && (
          <ApplicantModalContent
            applicant={profile as any}
            pfp_fetcher={UserService.get_my_pfp_url}
            pfp_route="/users/me/pic"
            open_resume={async () => {
              closeProfilePreviewModal();
              await syncResumeUrl();
              openResumeModal();
            }}
            open_calendar={async () => {
              openURL(profile?.calendar_link);
            }}
          />
        )}
      </ProfilePreviewModal>

      {/* Resume Modal */}
      {resumeUrl.length > 0 && (
        <ResumeModal>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
            <PDFPreview url={resumeUrl} />
          </div>
        </ResumeModal>
      )}

      {/* Incomplete Profile Modal */}
      <IncompleteProfileModal>
        <div className="p-6">
          {(() => {
            const { missing, labels } = getMissingProfileFields(profile);
            const missingCount = missing.length;

            return (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    You need to complete your profile before applying to jobs.
                    {missingCount === 1
                      ? "There is 1 required field missing."
                      : `There are ${missingCount} required fields missing.`}
                  </p>
                </div>

                {/* Missing Fields List */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Missing Information
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {missing.map((field) => (
                      <div
                        key={field}
                        className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium text-orange-800">
                          {labels[field]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => closeIncompleteProfileModal()}
                    className="flex-1 h-12 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      closeIncompleteProfileModal();
                      router.push("/profile");
                    }}
                    size="md"
                    scheme="supportive"
                    className="h-12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Complete Profile
                    </div>
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      </IncompleteProfileModal>
    </>
  );
}
