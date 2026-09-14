import type { RefObject } from "react";
import type {
  useJobListingsPage,
  useProfileData,
} from "@/lib/api/student.data.api";
import type { Job } from "@/lib/db/db.types";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";

/**
 * Props shared by the mobile and desktop search result views
 * (SearchResultsMobile / SearchResultsDesktop). The parent SearchPage
 * owns all the state; these views are presentational.
 */
export interface SearchResultsBaseProps {
  /** The `useJobListingsPage(...)` result for the current page/filters. */
  jobs: ReturnType<typeof useJobListingsPage>;
  /** Just this page's rows (`jobs.jobs`), passed explicitly for clarity. */
  jobsPage: Job[];
  jobsPageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  /** List container ref, used by the parent to scroll to top on page change. */
  listRef: RefObject<HTMLDivElement | null>;

  // selection / bulk apply
  selectMode: boolean;
  setSelectMode: (value: boolean) => void;
  toggleSelect: (job: Job) => void;
  isSelected: (jobId?: string) => boolean;

  onJobCardClick: (job: Job) => void;
}

export interface SearchResultsDesktopProps extends SearchResultsBaseProps {
  selectedJob: Job | null;
  profileData: ReturnType<typeof useProfileData>["data"];
  onSingleApply: (payload: ApplyPayload) => Promise<void>;
}
