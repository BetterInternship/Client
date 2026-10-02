"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card } from "@betterinternship/components";
import { CheckCircle2, FileUp, Trash2, type LucideIcon } from "lucide-react";
import type { ApplicationAction } from "@/lib/consts/application";
import type { EmployerApplication, Job, PublicUser } from "@/lib/db/db.types";
import type { ResumeDTO, EligibleListing } from "@/lib/api/services";
import { useGlobalModal } from "@/components/providers/modal-provider/ModalProvider";
import {
  DefaultModalLayout,
  SlideUpModalLayout,
} from "@/components/providers/modal-provider/ModalLayout";
import { HeaderIcon } from "@/components/ui/text";
import { AddResumeModal } from "@/components/features/student/profile/AddResumeModal";
import { DigestOptoutModalContent } from "@/components/features/hire/account/digest-optout-dialog";
import { IomPartnershipModalContent } from "@/components/features/hire/iom-partnership-modal";
import ApplicationActionModal, {
  getApplicationActionModalTitle,
} from "./ApplicationActionModal";
import DeleteJobListingModal from "./DeleteJobListingModal";
import CloseListingModal from "./CloseListingModal";
import DeleteResumeModal from "./DeleteResumeModal";
import DiscardEditModal from "./DiscardEditModal";
import { MoaUploadModal } from "./MoaUploadModal";
import { ApplyModal } from "./components/ApplyModal";
import { CancelFormModal } from "./components/CancelFormModal";
import { FollowUpFormModal } from "./components/ResendFormModal";
import { FormSubmissionSuccessModal } from "./components/FormSubmissionSuccessModal";
import { MassApplyResults } from "./components/MassApplyResults";
import { MissingRequirementsModal } from "./components/MissingRequirementsModal";
import { ShareJobModal } from "./components/ShareJobModal";
import { SuccessModal } from "./components/SuccessModal";
import { SuperListingClosedModal } from "./components/SuperListingClosedModal";
import { WarningModal } from "./components/WarningModal";
import { FormFillPdfViewer } from "@betterinternship/core/pdf-viewer";
import type { MassApplyResultsData } from "./components/MassApplyResults";

type PreviewEntry = {
  category: string;
  title: string;
  description: string;
  open: () => void;
};

type PreviewOptions = {
  title?: React.ReactNode;
  showHeaderDivider?: boolean;
  showCloseButton?: boolean;
  panelClassName?: string;
};

const PREVIEW_JOB = {
  id: "modal-preview-job",
  title: "Product Designer Intern",
  description:
    "Join a small product team building thoughtful tools for students and employers.",
  requirements: "Strong communication skills and a portfolio of your work.",
  location: "Manila, Philippines",
  is_active: true,
  employer: { name: "Acme Studio" },
  internship_preferences: {
    internship_type: "credited",
    expected_start_date: Date.now() + 60 * 24 * 60 * 60 * 1000,
    expected_duration_hours: 480,
  },
} as unknown as Job;

const PREVIEW_PROFILE = {
  id: "modal-preview-student",
  first_name: "Avery",
  last_name: "Santos",
  university: "De La Salle University",
  degree: "Bachelor of Science in Information Technology",
  github_link: "https://github.com/avery-preview",
  portfolio_link: "https://example.com/avery-portfolio",
  internship_preferences: {
    internship_type: "credited",
    expected_start_date: Date.now() + 60 * 24 * 60 * 60 * 1000,
    expected_duration_hours: 480,
  },
} as unknown as PublicUser;

const PREVIEW_APPLICATIONS = [
  {
    id: "modal-preview-application-1",
    user: { first_name: "Avery", last_name: "Santos" },
    status: 0,
  },
  {
    id: "modal-preview-application-2",
    user: { first_name: "Jordan", last_name: "Lee" },
    status: 1,
  },
] as unknown as EmployerApplication[];

const PREVIEW_LISTINGS = [
  { id: "modal-preview-listing-1", title: "Product Designer Intern" },
  { id: "modal-preview-listing-2", title: "Software Engineering Intern" },
] as EligibleListing[];

const applicationActionVariants: {
  type: ApplicationAction;
  title: string;
}[] = [
  { type: "ACCEPT", title: "Accept application" },
  { type: "REJECT", title: "Reject application" },
  { type: "SHORTLIST", title: "Shortlist application" },
  { type: "ARCHIVE", title: "Archive application" },
  { type: "UNARCHIVE", title: "Unarchive application" },
  { type: "DELETE", title: "Delete application" },
  { type: "CHANGE_STATUS", title: "Change application status" },
  { type: "NONE", title: "Unknown application action" },
];

const modalTitleWithIcon = (Icon: LucideIcon, title: string) => (
  <div className="flex min-w-0 items-center gap-3">
    <HeaderIcon icon={Icon} />
    <h2 className="truncate text-base font-semibold">{title}</h2>
  </div>
);

export function ModalPreviewGallery() {
  const { openModal, closeModal } = useGlobalModal();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Give query-driven dialogs deterministic local data so the preview does
    // not depend on an authenticated API session.
    queryClient.setQueryData(["share-link", PREVIEW_JOB.id], {
      url: "https://hire.betterinternship.com/share/modal-preview",
    });
    queryClient.setQueryData(["my-resumes"], {
      resumes: [],
      default_resume: null,
    });
    queryClient.setQueryData(["my-profile"], { user: PREVIEW_PROFILE });
  }, [queryClient]);

  const openPreview = useCallback(
    (slug: string, content: React.ReactNode, options: PreviewOptions = {}) => {
      const modalName = `modal-preview-${slug}`;
      openModal(modalName, DefaultModalLayout, <div inert>{content}</div>, {
        title: options.title,
        showHeaderDivider: options.showHeaderDivider ?? false,
        showCloseButton: options.showCloseButton ?? true,
        closeOnBackdropClick: true,
        closeOnEscapeKey: true,
        panelClassName: options.panelClassName,
      });
    },
    [openModal],
  );

  const openSlidePreview = useCallback(
    (slug: string, content: React.ReactNode, title: string) => {
      openModal(
        `modal-preview-${slug}`,
        SlideUpModalLayout,
        <div inert>{content}</div>,
        {
          title,
          showCloseButton: true,
          closeOnBackdropClick: true,
          closeOnEscapeKey: true,
        },
      );
    },
    [openModal],
  );

  const closeFor = (slug: string) => () => closeModal(`modal-preview-${slug}`);

  const actionEntries: PreviewEntry[] = applicationActionVariants.map(
    ({ type, title }) => {
      const slug = `application-action-${type.toLowerCase()}`;
      const applications =
        type === "CHANGE_STATUS"
          ? PREVIEW_APPLICATIONS
          : [PREVIEW_APPLICATIONS[0]];

      return {
        category: "Applications",
        title,
        description: "Applicant decision and status confirmation dialog.",
        open: () =>
          openPreview(
            slug,
            <ApplicationActionModal
              type={type}
              applicants={applications}
              isProcessing={false}
              acceptanceMessage="We enjoyed meeting you and look forward to working together."
              onAcceptanceMessageChange={() => {}}
              onConfirm={() => {}}
              onCancel={() => {}}
            />,
            {
              title: getApplicationActionModalTitle(type, applications),
              showHeaderDivider: false,
            },
          ),
      };
    },
  );

  const entries: PreviewEntry[] = [
    {
      category: "Hire & listings",
      title: "Delete listing",
      description: "Listing deletion confirmation with applicant notice.",
      open: () =>
        openPreview(
          "delete-listing",
          <DeleteJobListingModal
            job={PREVIEW_JOB}
            isProcessing={false}
            onConfirm={() => {}}
            onCancel={closeFor("delete-listing")}
            pendingApplicantCount={3}
          />,
          { title: `Delete ${PREVIEW_JOB.title}?` },
        ),
    },
    {
      category: "Hire & listings",
      title: "Close listing",
      description:
        "Listing closure notice with pending and shortlisted counts.",
      open: () =>
        openPreview(
          "close-listing",
          <CloseListingModal
            pendingCount={3}
            shortlistedCount={1}
            isProcessing={false}
            onConfirm={() => {}}
            onReviewFirst={() => {}}
            onCancel={closeFor("close-listing")}
          />,
          { title: `Close ${PREVIEW_JOB.title}?` },
        ),
    },
    {
      category: "Hire & listings",
      title: "Discard listing edits",
      description: "Unsaved listing changes confirmation.",
      open: () =>
        openPreview(
          "discard-edit",
          <DiscardEditModal
            onConfirm={() => {}}
            onCancel={closeFor("discard-edit")}
          />,
          { title: "Discard your changes?" },
        ),
    },
    {
      category: "Hire & listings",
      title: "Share listing",
      description: "Copyable short-link dialog.",
      open: () =>
        openPreview("share-job", <ShareJobModal job={PREVIEW_JOB} />, {
          title: `Share listing — ${PREVIEW_JOB.title}`,
        }),
    },
    ...actionEntries,
    {
      category: "Hire & listings",
      title: "Applicant email warning",
      description: "Generic warning with primary and secondary actions.",
      open: () =>
        openPreview(
          "warning",
          <WarningModal
            message="This listing was paused after a period of inactivity. Re-activate it to make edits."
            primaryAction={{ label: "Re-activate", onClick: () => {} }}
            secondaryAction={{ label: "Cancel", onClick: () => {} }}
            close={closeFor("warning")}
          />,
          { title: "This listing is inactive", showCloseButton: false },
        ),
    },
    {
      category: "Hire & listings",
      title: "Notifications required",
      description: "Notice shown when no teammate receives applicant emails.",
      open: () =>
        openPreview(
          "notifications-required",
          <WarningModal
            message="No one on your team currently receives applicant emails. Turn on notifications before you can have active listings."
            primaryAction={{
              label: "Turn on notifications",
              onClick: () => {},
            }}
            close={closeFor("notifications-required")}
          />,
          { title: "Notifications are off", panelClassName: "sm:max-w-md" },
        ),
    },
    {
      category: "Hire & listings",
      title: "Turn off applicant emails",
      description: "Digest opt-out warning and active listing selector.",
      open: () =>
        openPreview(
          "digest-optout",
          <DigestOptoutModalContent
            companyName="Acme Studio"
            listings={PREVIEW_LISTINGS}
            onDone={() => {}}
          />,
          { title: "Turn off applicant emails?" },
        ),
    },
    {
      category: "Hire & listings",
      title: "University partnership",
      description: "Partnership Portal choice dialog.",
      open: () =>
        openPreview(
          "iom-partnership",
          <IomPartnershipModalContent onClose={closeFor("iom-partnership")} />,
          {
            title:
              "Has your company partnered with universities through our Partnership Portal?",
            panelClassName: "sm:max-w-5xl",
          },
        ),
    },
    {
      category: "Hire & listings",
      title: "Upload MOA documents",
      description: "Upload and review MOA document dialog.",
      open: () =>
        openPreview(
          "moa-upload",
          <MoaUploadModal
            onDone={closeFor("moa-upload")}
            onCancel={closeFor("moa-upload")}
          />,
          { title: "Upload MOA Documents", panelClassName: "sm:max-w-2xl" },
        ),
    },
    {
      category: "Student",
      title: "Delete resume",
      description: "Resume deletion confirmation.",
      open: () =>
        openPreview(
          "delete-resume",
          <DeleteResumeModal
            resume={
              {
                id: "modal-preview-resume",
                label: "Product Designer Resume",
              } as unknown as ResumeDTO
            }
            isProcessing={false}
            onConfirm={() => {}}
            onCancel={closeFor("delete-resume")}
          />,
          {
            title: modalTitleWithIcon(
              Trash2,
              "Delete Product Designer Resume?",
            ),
          },
        ),
    },
    {
      category: "Student",
      title: "Add resume",
      description: "Resume upload and label form.",
      open: () =>
        openPreview(
          "add-resume",
          <AddResumeModal
            onCancel={closeFor("add-resume")}
            onComplete={closeFor("add-resume")}
            isAtResumeLimit={false}
          />,
          { title: modalTitleWithIcon(FileUp, "Upload new resume") },
        ),
    },
    {
      category: "Student",
      title: "Complete profile before applying",
      description: "Two-step apply dialog with resume and internship details.",
      open: () =>
        openPreview(
          "complete-profile-apply",
          <ApplyModal
            profile={PREVIEW_PROFILE}
            onApply={() => {}}
            onCancel={closeFor("complete-profile-apply")}
          />,
          { showHeaderDivider: false, showCloseButton: false },
        ),
    },
    {
      category: "Student",
      title: "Missing requirements",
      description: "Profile requirements notice and update action.",
      open: () =>
        openPreview(
          "missing-requirements",
          <MissingRequirementsModal
            missing={["GitHub profile link", "Portfolio link"]}
            onCancel={closeFor("missing-requirements")}
          />,
          { showHeaderDivider: false, showCloseButton: false },
        ),
    },
    {
      category: "Student",
      title: "Bulk application summary",
      description: "Applied, skipped, and failed listing summary.",
      open: () => {
        const data: MassApplyResultsData = {
          ok: [PREVIEW_JOB],
          skipped: [
            {
              job: { ...PREVIEW_JOB, id: "preview-skipped-job" } as Job,
              reason: "Already applied",
            },
          ],
          failed: [
            {
              job: { ...PREVIEW_JOB, id: "preview-failed-job" } as Job,
              error: "The application could not be submitted.",
            },
          ],
        };

        openPreview(
          "mass-apply-results",
          <MassApplyResults
            data={data}
            onClose={closeFor("mass-apply-results")}
            onClearSelection={closeFor("mass-apply-results")}
          />,
          { title: "Bulk application summary", showHeaderDivider: true },
        );
      },
    },
    {
      category: "Student",
      title: "Application blocked for requirements",
      description: "Super-listing round closed message and choices.",
      open: () =>
        openPreview(
          "super-listing-closed",
          <SuperListingClosedModal onView={() => {}} onLeave={() => {}} />,
          { title: " ", showHeaderDivider: false, showCloseButton: false },
        ),
    },
    {
      category: "Forms",
      title: "Form submission success",
      description: "Manual form generation success state.",
      open: () =>
        openPreview(
          "form-submission-success",
          <FormSubmissionSuccessModal
            submissionType="manual"
            onClose={closeFor("form-submission-success")}
          />,
          { showHeaderDivider: false, showCloseButton: false },
        ),
    },
    {
      category: "Forms",
      title: "Cancel form request",
      description: "Cancel an outstanding form request.",
      open: () =>
        openPreview(
          "cancel-form-request",
          <CancelFormModal formProcessId="modal-preview-form" />,
          { title: "Cancel this form request?", showCloseButton: false },
        ),
    },
    {
      category: "Forms",
      title: "Send follow-up email",
      description: "Follow-up email confirmation.",
      open: () =>
        openPreview(
          "follow-up-form-request",
          <FollowUpFormModal formProcessId="modal-preview-form" />,
          { title: "Send follow-up email?", showCloseButton: false },
        ),
    },
    {
      category: "Forms",
      title: "PDF preview",
      description: "Full-screen form PDF slide-up viewer.",
      open: () =>
        openSlidePreview(
          "preview-form-pdf",
          <FormFillPdfViewer
            documentUrl="/Student_MOA.pdf"
            blocks={[]}
            values={{}}
            showToolbar={false}
          />,
          "PDF Preview",
        ),
    },
    {
      category: "General",
      title: "Success confirmation",
      description: "Generic success message and actions.",
      open: () =>
        openPreview(
          "success",
          <SuccessModal
            icon={CheckCircle2}
            iconColor="text-supportive"
            title="Changes saved"
            message="Your changes have been saved successfully."
            primaryAction={{ label: "Done", onClick: () => {} }}
            close={closeFor("success")}
          />,
          { title: " ", showHeaderDivider: false, showCloseButton: false },
        ),
    },
    {
      category: "General",
      title: "Custom details dialog",
      description: "Generic centered modal layout with custom content.",
      open: () =>
        openPreview(
          "centered-details",
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Any React content can be shown in this shared dialog.
            </p>
            <div className="rounded-[0.33em] border p-3 text-sm">
              Example custom content
            </div>
          </div>,
          { title: "Custom details" },
        ),
    },
  ];

  const categories = Array.from(
    new Set(entries.map((entry) => entry.category)),
  );

  return (
    <main className="min-h-full bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Developer preview
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Modal preview gallery
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-gray-600">
            Browse the shared modal registry using sample data. Preview actions
            are disabled to avoid changing accounts, listings, or forms.
          </p>
        </header>

        {categories.map((category) => (
          <section key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries
                .filter((entry) => entry.category === category)
                .map((entry) => (
                  <Card
                    key={`${entry.category}-${entry.title}`}
                    className="flex flex-col gap-3 rounded-[0.33em] border bg-white p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        {entry.title}
                      </h3>
                      <p className="text-sm leading-5 text-gray-500">
                        {entry.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-auto w-full"
                      onClick={entry.open}
                    >
                      Preview modal
                    </Button>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
