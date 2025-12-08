import { useState } from "react";
import { EmployerApplication } from "@/lib/db/db.types";

/**
 * Hook for handling application selection on the applicants page.
 * @param applications Visible applications
 */
export function useApplicationSelection(applications: EmployerApplication[]) {
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string, next?: boolean) => {
      setSelectedApplications((prev) => {
        const nextSet = new Set(prev);
        if (typeof next === "boolean") {
          next ? nextSet.add(id) : nextSet.delete(id);
        } else {
          nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
        }
  
        return nextSet;
      });
    };
  
  const selectAll = () => {
    // only select all visible applications.
    setSelectedApplications(
      new Set(applications.map((application) => application.id!))
    )
  };

  const unselectAll = () => {
    setSelectedApplications(new Set());
  };

  const toggleSelectAll = () => {
    selectedApplications.size === applications.length ? unselectAll() : selectAll();
  };

  return {
    selectedApplications,
    toggleSelect,
    selectAll,
    unselectAll,
    toggleSelectAll,
  };
}