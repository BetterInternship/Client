import { useState, useEffect } from "react";
import { Employer, PrivateUser } from "@/lib/db/db.types";
import { handleApiError } from "./services";
import { EmployerAuthService } from "./hire.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APIClient, APIRoute } from "@/lib/api/api-client";
import { FetchResponse } from "@/lib/api/use-fetch";

/**
 * Retrieves aggregate employer information.
 * @returns
 */
export function useEmployers() {
  const queryClient = useQueryClient();
  const { isPending, error } = useQuery({
    queryKey: ["god-employers"],
    queryFn: async () => {
      const { success, employers } =
        await EmployerAuthService.getAllEmployers();
      if (!success) return {};
      await Promise.all(
        employers.map((employer) =>
          queryClient.setQueryData(["god-employers", employer.id], employer)
        )
      );
      updateEmployers();
      return {};
    },
  });
  const [employers, setEmployers] = useState<Employer[]>([]);
  const { isPending: isVerifying, mutate: verify } = useMutation({
    mutationFn: EmployerAuthService.verifyEmployer,
    onMutate: async (employerId) =>
      (await queryClient.getQueryData([
        "god-employers",
        employerId,
      ])) as Employer,
    onSettled: async (response, error, variables, oldEmployer) => {
      await queryClient.invalidateQueries({
        queryKey: ["god-employers", response?.employer.id],
      });
      const result = await queryClient.setQueryData(
        ["god-employers", response?.employer.id],
        {
          ...oldEmployer,
          ...response?.employer,
        }
      );
      updateEmployers();
      return result;
    },
  });
  const { isPending: isUnverifying, mutate: unverify } = useMutation({
    mutationFn: EmployerAuthService.unverifyEmployer,
    onMutate: async (employerId) =>
      (await queryClient.getQueryData([
        "god-employers",
        employerId,
      ])) as Employer,
    onSettled: async (response, error, variables, oldEmployer) => {
      await queryClient.invalidateQueries({
        queryKey: ["god-employers", response?.employer.id],
      });
      const result = await queryClient.setQueryData(
        ["god-employers", response?.employer.id],
        {
          ...oldEmployer,
          ...response?.employer,
        }
      );
      updateEmployers();
      return result;
    },
  });

  const updateEmployers = () => {
    setTimeout(() =>
      setEmployers(
        queryClient
          .getQueriesData({
            queryKey: ["god-employers"],
          })
          .map((e) => e[1] as Employer)
          .filter((e) => e?.id)
      )
    );
  };

  useEffect(() => {
    updateEmployers();
  }, []);

  return {
    isPending,
    isVerifying,
    isUnverifying,
    data: employers,
    verify,
    unverify,
    error,
  };
}

/**
 * Retrieves aggregate user info.
 * @returns
 */
export function useUsers() {
  const [users, set_users] = useState<PrivateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await EmployerAuthService.getAllUsers();
      if (response.success)
        // @ts-ignore
        set_users(response.users ?? []);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
  };
}

export const StudentGodAPI = {
  impersonate: async (studentId: string, reason?: string) =>
    APIClient.post<FetchResponse>(
      APIRoute("student-god")
        .r("students", studentId, "impersonations")
        .build(),
      reason ? { reason } : {}
    ),
  stop: async () =>
    APIClient.post<FetchResponse>(
      APIRoute("student-god").r("impersonations", "stop").build(),
      {}
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