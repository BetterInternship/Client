import { Employer } from "@/lib/db/db.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import { FetchResponse } from "@/lib/api/use-fetch";
import { EmployerAuthService } from "./hire.api";

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

export function useGodEmployers(params: {
  page: number;
  limit: number;
  search?: string;
  is_verified?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}) {
  return useQuery({
    // -v2: team_emails' shape changed (comma-joined string -> {email,
    // receives_applicant_digest}[]) — this query is persisted for 24h
    // (tanstack-provider.tsx), so the key must change too or old sessions
    // keep serving the stale string shape and crash TeamEmailsList's .map.
    queryKey: ["god-employers-v2", params],
    queryFn: () =>
      APIClient.get<PaginatedEmployersResponse>(
        APIRouteBuilder("god")
          .r("employers")
          .p({
            page: params.page,
            limit: params.limit,
            search: params.search,
            is_verified: params.is_verified,
            sort_by: params.sort_by,
            sort_dir: params.sort_dir,
          })
          .build(),
      ),
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
      APIClient.get<WeeklyStatsResponse>(
        APIRouteBuilder("god")
          .r("stats", "applications")
          .p(weeks ? { weeks } : {})
          .build(),
      ),
    staleTime: 0,
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
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("employers", employerId, "listings").build(),
        data,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useRegisterEmployer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; user_email: string }) =>
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("register").build(),
        data,
      ),
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
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("employers", "create-and-list").build(),
        data,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export function useImportCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: Record<string, string>[]) =>
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("employers", "import-csv").build(),
        { rows },
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-employers-v2"] });
    },
  });
}

export const StudentGodAPI = {
  impersonate: async (studentId: string, reason?: string) =>
    APIClient.post<FetchResponse>(
      APIRouteBuilder("student-god")
        .r("students", studentId, "impersonations")
        .build(),
      reason ? { reason } : {},
    ),
  stop: async () =>
    APIClient.post<FetchResponse>(
      APIRouteBuilder("student-god").r("impersonations", "stop").build(),
      {},
    ),
  massApply: async (dto: { jobId: string; studentIds: string[] }) =>
    APIClient.post<FetchResponse>(
      APIRouteBuilder("student-god").r("mass-apply").build(),
      dto,
    ),
};

export function useStudentImpersonation() {
  const impersonate = useMutation({
    mutationFn: ({
      studentId,
      reason,
    }: {
      studentId: string;
      reason?: string;
    }) => StudentGodAPI.impersonate(studentId, reason),
  });
  const stop = useMutation({
    mutationFn: () => StudentGodAPI.stop(),
  });
  return { impersonate, stop };
}

export function useMassApply() {
  return useMutation({
    mutationFn: (dto: { jobId: string; studentIds: string[] }) =>
      StudentGodAPI.massApply(dto),
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
      APIClient.get<PaginatedMoaUploadsResponse>(
        APIRouteBuilder("god")
          .r("moa-documents")
          .p({
            page: params.page,
            limit: params.limit,
            status: params.status,
          })
          .build(),
      ),
  });
}

export function useApproveMoaUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      moaId,
      universityId,
    }: {
      moaId: string;
      universityId: string;
    }) =>
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("moa-documents", moaId, "approve").build(),
        { university_id: universityId },
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-moa-uploads"] });
    },
  });
}

export function useRejectMoaUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moaId: string) =>
      APIClient.post<FetchResponse>(
        APIRouteBuilder("god").r("moa-documents", moaId, "reject").build(),
        {},
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["god-moa-uploads"] });
    },
  });
}

export function useGodUniversities() {
  return useQuery({
    queryKey: ["god-universities"],
    queryFn: () =>
      APIClient.get<{ universities: University[] }>(
        APIRouteBuilder("god").r("moa-universities").build(),
      ),
  });
}
