import { Employer, Job } from "@/lib/db/db.types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import { FetchResponse } from "@/lib/api/use-fetch";
import { EmployerAuthService } from "./hire.api";
import {
  godsControllerCreateListing,
  godsControllerGetApplicationStats,
  godsControllerGetEmployerLoginStats,
  godsControllerGetEmployers,
  godsControllerGetMoaDocuments,
  godsControllerGetMoaDocumentUrl,
  godsControllerGetMoaUniversities,
  godsControllerImportCsv,
  godsControllerApproveMoaDocument,
  godsControllerRejectMoaDocument,
  godsControllerRegisterAndList,
  godsControllerCreateEmployer,
} from "./generated/endpoints/gods/gods";

export interface ListingData {
  title: string;
  description: string;
  location?: string;
  requirements?: string;
  salary?: string;
  allowance?: number;
  salary_freq?: number;
  is_active?: boolean;
  is_unlisted?: boolean;
  is_year_round?: boolean;
  start_date?: number;
  end_date?: number;
  internship_preferences?: Record<string, unknown>;
}

export interface PaginatedEmployersResponse extends FetchResponse {
  data: Employer[];
  total: number;
}

export interface WeeklyStatsResponse extends FetchResponse {
  stats: {
    week_start: string;
    applications: number;
    applicants: number;
    applications_wow_growth: number | null;
    applicants_wow_growth: number | null;
  }[];
}

export interface EmployerLoginMetrics {
  total_employers: number;
  logged_in_this_week: number;
  logged_in_this_week_percent: number;
  previously_logged_in: number;
  returning_this_week: number;
  returning_this_week_percent: number;
  first_time_logins_this_week: number;
  never_logged_in: number;
  never_logged_in_percent: number;
  cached_at: string;
}

export interface EmployerLoginMetricsResponse extends FetchResponse {
  stats: EmployerLoginMetrics;
}

export function useGodEmployers(params: {
  page: number;
  limit: number;
  search?: string;
  is_verified?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}) {
  return useQuery({
    // -v2: team_emails' shape changed (comma-joined string -> {email,
    // receives_applicant_digest}[]) — this query is persisted for 24h
    // (tanstack-provider.tsx), so the key must change too or old sessions
    // keep serving the stale string shape and crash TeamEmailsList's .map.
    queryKey: ["god-employers-v2", params],
    // The generated model types dates as the strings they are on the wire;
    // Employer (db.types) types them as Date. The facade keeps its old
    // return type until callers move to the generated models.
    queryFn: () =>
      godsControllerGetEmployers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        is_verified: params.is_verified,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      }) as unknown as Promise<PaginatedEmployersResponse>,
  });
}

export function useVerifyEmployer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: EmployerAuthService.verifyEmployer,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useUnverifyEmployer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: EmployerAuthService.unverifyEmployer,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useWeeklyStats(weeks?: number) {
  return useQuery({
    queryKey: ["god-stats", weeks],
    queryFn: () =>
      godsControllerGetApplicationStats(
        weeks ? { weeks: String(weeks) } : undefined,
      ) as unknown as Promise<WeeklyStatsResponse>,
    staleTime: 0,
  });
}

export function useEmployerLoginMetrics() {
  return useQuery({
    queryKey: ["god-employer-login-metrics"],
    queryFn: () =>
      godsControllerGetEmployerLoginStats() as unknown as Promise<EmployerLoginMetricsResponse>,
  });
}

export function useRefreshEmployerLoginMetrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      APIClient.post<EmployerLoginMetricsResponse>(
        APIRouteBuilder("god").r("stats", "employer-logins", "refresh").build(),
      ),
    onSuccess: (response) => {
      if (response.success && response.stats) {
        queryClient.setQueryData(["god-employer-login-metrics"], response);
      }
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employerId,
      data,
    }: {
      employerId: string;
      data: ListingData;
    }) =>
      godsControllerCreateListing(
        employerId,
        data,
      ) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useRegisterEmployer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; user_email: string }) =>
      godsControllerCreateEmployer(data) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useRegisterAndList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: {
        name: string;
        email: string;
      } & ListingData,
    ) =>
      godsControllerRegisterAndList(
        data,
      ) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useImportCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: Record<string, string>[]) =>
      godsControllerImportCsv({ rows }) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

// ── MOA document verification ───────────────────────────────────────────

export interface MoaUpload {
  id: string;
  employer_id: string;
  document_link: string | null;
  status: string | null;
  university_id: string | null;
  start_date: string;
  expires_at: string;
  employer_name: string | null;
  university_name: string | null;
}

export interface PaginatedMoaUploadsResponse extends FetchResponse {
  data: MoaUpload[];
  total: number;
}

export interface University {
  id: string;
  name: string;
}

export function useGodMoaUploads(params: {
  page: number;
  limit: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["god-moa-uploads", params],
    queryFn: () =>
      godsControllerGetMoaDocuments({
        page: String(params.page),
        limit: String(params.limit),
        status: params.status,
      }) as unknown as Promise<PaginatedMoaUploadsResponse>,
  });
}

export function getGodMoaDocumentUrl(moaId: string) {
  return godsControllerGetMoaDocumentUrl(moaId) as unknown as Promise<{
    success?: boolean;
    url?: string;
    error?: string;
  }>;
}

export function useApproveMoaUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      moaId,
      universityId,
      expiresAt,
    }: {
      moaId: string;
      universityId: string;
      expiresAt?: string;
    }) =>
      godsControllerApproveMoaDocument(moaId, {
        university_id: universityId,
        expires_at: expiresAt,
      }) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-moa-uploads"] });
    },
  });
}

export function useRejectMoaUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moaId: string) =>
      godsControllerRejectMoaDocument(
        moaId,
      ) as unknown as Promise<FetchResponse>,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-moa-uploads"] });
    },
  });
}

export function useGodUniversities() {
  return useQuery({
    queryKey: ["god-universities"],
    queryFn: () =>
      godsControllerGetMoaUniversities() as unknown as Promise<{
        universities: University[];
      }>,
  });
}

// ── Top pages (Docs/plans/TOP_PAGES_IMPLEMENTATION_PLAN.md) ────────────────
// Hand-written facade for now — D25: the orval codegen migration isn't
// merged yet. See CLIENT_API_CODEGEN_MIGRATION_PLAN.md batch TP.

export interface TopPageListRow {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  member_count: number;
  hidden_count: number;
  updated_at: string;
}

export interface TopPageListResponse extends FetchResponse {
  pages: TopPageListRow[];
}

export function useGodTopPages() {
  return useQuery({
    queryKey: ["god-top-pages"],
    queryFn: () =>
      APIClient.get<TopPageListResponse>(
        APIRouteBuilder("god").r("top-pages").build(),
      ),
  });
}

export type TopPageMemberState =
  | "live"
  | "hibernating"
  | "off"
  | "unlisted"
  | "unverified_employer";

export interface TopPageMember {
  job_id: string;
  position: number;
  state: TopPageMemberState;
  title: string;
  employer_name: string | null;
  last_activated_at?: string;
}

export interface GodTopPageDetail {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  updated_at: string;
  members: TopPageMember[];
  /** How many universities this page is ticked for in the university grid. */
  university_count: number;
}

export interface SlugOwner {
  id: string;
  name: string;
}

// The server sends the conflict/invalid-job-ids shape directly over the
// response body on a non-2xx status (no thrown exception on this codebase's
// fetch client — see api-client.ts), so create/save's response type carries
// every possible field rather than just the success shape.
export interface GodTopPageResponse extends FetchResponse {
  page?: GodTopPageDetail;
  owner?: SlugOwner;
  job_ids?: string[];
}

export function useGodTopPage(id: string | undefined) {
  return useQuery({
    queryKey: ["god-top-page", id],
    queryFn: () =>
      APIClient.get<GodTopPageResponse>(
        APIRouteBuilder("god")
          .r("top-pages", id as string)
          .build(),
      ),
    enabled: !!id,
  });
}

export function useCreateTopPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      APIClient.post<GodTopPageResponse>(
        APIRouteBuilder("god").r("top-pages").build(),
        { name },
      ),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["god-top-pages"] });
      }
    },
  });
}

export interface SaveTopPagePayload {
  name: string;
  is_published: boolean;
  job_ids: string[];
  updated_at: string;
}

export function useSaveTopPage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveTopPagePayload) =>
      APIClient.put<GodTopPageResponse>(
        APIRouteBuilder("god").r("top-pages", id).build(),
        payload,
      ),
    onSuccess: (response) => {
      if (response.success && response.page) {
        queryClient.setQueryData(["god-top-page", id], response);
        queryClient.invalidateQueries({ queryKey: ["god-top-pages"] });
        // The grid shows each page's name and published state as a column.
        void queryClient.invalidateQueries({
          queryKey: ["god-top-universities"],
        });
      }
    },
  });
}

// ── Top pages: the university grid (TOP_PAGES_UNIVERSITY_PLAN.md D15) ──────

export interface GodTopUniversityRow {
  id: string;
  name: string;
  /** The university's part of the URL — built from its name by the server. */
  slug: string;
  accent_hex: string | null;
  has_partner_account: boolean;
  /** No usable URL name, or the same one as another university. */
  slug_clash: boolean;
  page_ids: string[];
}

export interface GodTopGridPage {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
}

export interface GodTopUniversityGridResponse extends FetchResponse {
  universities?: GodTopUniversityRow[];
  pages?: GodTopGridPage[];
}

export function useGodTopUniversityGrid() {
  return useQuery({
    queryKey: ["god-top-universities"],
    queryFn: () =>
      APIClient.get<GodTopUniversityGridResponse>(
        APIRouteBuilder("god").r("top-pages", "universities").build(),
      ),
    // Always refetch on open: this is an editor, and a stale grid would
    // quietly overwrite another admin's ticks on Save.
    staleTime: 0,
  });
}

export interface SaveTopUniversityRow {
  id: string;
  accent_hex: string | null;
  /** Replaces the university's ticks — not merged into them. */
  page_ids: string[];
}

export function useSaveTopUniversityGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (universities: SaveTopUniversityRow[]) =>
      APIClient.put<GodTopUniversityGridResponse>(
        APIRouteBuilder("god").r("top-pages", "universities").build(),
        { universities },
      ),
    onSuccess: (response) => {
      if (response.success && response.universities) {
        queryClient.setQueryData(["god-top-universities"], response);
        // Each page's editor shows how many universities it is ticked for.
        void queryClient.invalidateQueries({ queryKey: ["god-top-page"] });
      }
    },
  });
}

export interface SlugPreviewResult {
  slug: string;
  available: boolean;
  owner?: SlugOwner;
}

/**
 * Plain async call rather than a persistent useQuery — the editor's live
 * name preview debounces this itself and doesn't need cross-render caching.
 */
export async function fetchTopPageSlugPreview(
  name: string,
  pageId?: string,
): Promise<SlugPreviewResult> {
  return APIClient.get<SlugPreviewResult>(
    APIRouteBuilder("god")
      .r("top-pages", "slug-preview")
      .p({ name, page_id: pageId })
      .build(),
  );
}

export interface TopPageCandidate {
  id: string;
  title: string;
  employer_name: string | null;
  job_category_ids: string[];
  last_activated_at: string;
}

export interface TopPageCandidatesResponse extends FetchResponse {
  data: TopPageCandidate[];
  total: number;
}

export function useTopPageCandidates(params: {
  search?: string;
  category?: string;
  page: number;
}) {
  return useQuery({
    queryKey: ["god-top-page-candidates", params],
    queryFn: () =>
      APIClient.get<TopPageCandidatesResponse>(
        APIRouteBuilder("god")
          .r("top-pages", "candidates")
          .p({
            search: params.search,
            category: params.category,
            page: params.page,
          })
          .build(),
      ),
    placeholderData: keepPreviousData,
  });
}

export interface TopPagePreviewJobsResponse extends FetchResponse {
  jobs: Job[];
}

/**
 * Backs the editor's "Preview" button: shapes whatever job_ids it currently
 * has staged (possibly unsaved) the same way the public page shapes its own
 * members, rather than reading back whatever was last saved.
 */
export function useTopPagePreviewJobs(jobIds: string[]) {
  return useQuery({
    queryKey: ["god-top-page-preview-jobs", jobIds],
    queryFn: () =>
      APIClient.get<TopPagePreviewJobsResponse>(
        APIRouteBuilder("god")
          .r("top-pages", "preview-jobs")
          .p({ job_ids: jobIds.join(",") })
          .build(),
      ),
    enabled: jobIds.length > 0,
  });
}
