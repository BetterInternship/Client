/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-18 15:17:08
 * @ Modified time: 2026-01-06 19:30:02
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
    form_process_id: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    rejection_reason?: string;
    signing_parties?: IFormSigningParty[];
    status?: string;
  }[];
  loading: boolean;
  error?: string;
  // Helper functions for checking form status
  hasPendingInstance: (formLabel: string) => boolean;
  hasCompletedInstance: (formLabel: string) => boolean;
  shouldShowDuplicateWarning: (formLabel: string) => {
    show: boolean;
    hasPending: boolean;
    hasCompleted: boolean;
  };
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
    queryKey: ["my-forms"],
    queryFn: () => FormService.getMyGeneratedForms(),
    staleTime: 0,
    gcTime: 60 * 60 * 1000,
  });

  const mappedForms =
    forms
      ?.filter((f) => !!f.form_processes)
      ?.map((f) => ({
        label: f.form_label!,
        form_process_id: f.form_process_id,
        prefilled_document_id: f.form_processes.prefilled_document_id,
        pending_document_id: f.form_processes.pending_document_id,
        signed_document_id: f.form_processes.signed_document_id,
        latest_document_url: f.form_processes.latest_document_url,
        signing_parties: f.form_processes.signing_parties,
        rejection_reason: f.form_processes.rejection_reason,
        status: f.form_process_status,
        timestamp: f.timestamp,
      })) ?? [];

  // Helper function to check if form has pending instances
  const hasPendingInstance = (formLabel: string): boolean => {
    return mappedForms.some(
      (f) => f.label === formLabel && !!f.pending_document_id,
    );
  };

  // Helper function to check if form has completed instances
  const hasCompletedInstance = (formLabel: string): boolean => {
    return mappedForms.some(
      (f) => f.label === formLabel && !!f.signed_document_id,
    );
  };

  // Helper function to determine if we should show duplicate warning
  const shouldShowDuplicateWarning = (formLabel: string) => {
    const formInstances = mappedForms.filter((f) => f.label === formLabel);

    // If no existing instances, don't show warning
    if (formInstances.length === 0) {
      return { show: false, hasPending: false, hasCompleted: false };
    }

    // Check pending first (hierarchy: pending > completed)
    // Pending = no documentId (neither signed nor prefilled)
    const hasPending = formInstances.some(
      (f) => !f.signed_document_id && !f.prefilled_document_id,
    );
    if (hasPending) {
      return { show: true, hasPending: true, hasCompleted: false };
    }

    // Then check completed (has documentId: either signed or prefilled)
    const hasCompleted = formInstances.some(
      (f) => !!f.signed_document_id || !!f.prefilled_document_id,
    );
    if (hasCompleted) {
      return { show: true, hasPending: false, hasCompleted: true };
    }

    // No pending or completed instances (only rejected)
    return { show: false, hasPending: false, hasCompleted: false };
  };

  return (
    <MyFormsContext.Provider
      value={{
        forms: mappedForms,
        loading: isLoading,
        error: error?.message,
        hasPendingInstance,
        hasCompletedInstance,
        shouldShowDuplicateWarning,
      }}
    >
      {children}
    </MyFormsContext.Provider>
  );
};
