/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-18 15:17:08
 * @ Modified time: 2025-12-21 21:03:01
 * @ Description:
 *
 * These are the forms a user has generated or initiated.
 */

"use client";

import { FormService } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface IMyForms {
  forms: {
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    timestamp: number;
    singing_parties: { email: string; signed: boolean }[];
  }[];
  loading: boolean;
  error?: string;
}

const MyFormsContext = createContext<IMyForms>({} as IMyForms);

export const useMyForms = () => useContext<IMyForms>(MyFormsContext);

export const MyFormsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data: forms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my_forms"],
    queryFn: () => FormService.getMyGeneratedForms(),
    staleTime: 10_000,
    gcTime: 10_000,
  });

  return (
    <MyFormsContext.Provider
      value={{
        forms:
          forms?.map((f) => ({
            label: f.label ?? "",
            prefilled_document_id: f.pending_document_id,
            pending_document_id: f.pending_document_id,
            signed_document_id: f.pending_document_id,
            timestamp: parseInt(f.timestamp),
            singing_parties: [],
          })) ?? [],
        loading: isLoading,
        error: error?.message,
      }}
    >
      {children}
    </MyFormsContext.Provider>
  );
};
