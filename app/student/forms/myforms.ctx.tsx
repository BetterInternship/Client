/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-18 15:17:08
 * @ Modified time: 2026-01-03 01:16:40
 * @ Description:
 *
 * These are the forms a user has generated or initiated.
 */

"use client";

import { FormService } from "@/lib/api/services";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface IMyForms {
  forms: {
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    rejection_reason?: string;
    signing_parties?: IFormSigningParty[];
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
    staleTime: 0,
    gcTime: 60 * 60 * 1000,
  });

  const mappedForms =
    forms
      ?.filter((f) => !!f.form_processes)
      ?.map((f) => ({
        label: f.form_label!,
        prefilled_document_id: f.form_processes.prefilled_document_id,
        pending_document_id: f.form_processes.pending_document_id,
        signed_document_id: f.form_processes.signed_document_id,
        latest_document_url: f.form_processes.latest_document_url,
        signing_parties: f.form_processes.signing_parties,
        rejection_reason: f.form_processes.rejection_reason,
        timestamp: f.timestamp,
      })) ?? [];

  return (
    <MyFormsContext.Provider
      value={{
        forms: mappedForms,
        loading: isLoading,
        error: error?.message,
      }}
    >
      {children}
    </MyFormsContext.Provider>
  );
};
