import { Employer } from "@/lib/db/db.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
