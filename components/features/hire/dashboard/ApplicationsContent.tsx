// contains the contents to display the application rows
// rework of ApplicationsTable
"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { useAppContext } from "@/lib/ctx-app";
import { useDbRefs } from "@/lib/db/use-refs";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationsHeader } from "./ApplicationsHeader";
import { useState } from "react";
import { CommandMenu } from "@/components/ui/command-menu";
import { Check, SquareCheck, Star, Trash, X } from "lucide-react";
import { useEffect } from "react";
import { updateApplicationStatus } from "@/lib/api/services";

interface ApplicationsContentProps {
  applications: EmployerApplication[];
  statusId: number[];
  openChatModal: () => void;
  updateConversationId: (userId: string) => void;
  onApplicationClick: (application: EmployerApplication) => void;
  onNotesClick: (application: EmployerApplication) => void;
  onScheduleClick: (application: EmployerApplication) => void;
  onStatusChange: (application: EmployerApplication, status: number) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
}

export function ApplicationsContent({
  applications,
  statusId,
  openChatModal,
  updateConversationId,
  onApplicationClick,
  onNotesClick,
  onScheduleClick,
  onStatusChange,
  setSelectedApplication,
}: ApplicationsContentProps) {
  const { isMobile } = useAppContext();
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(
    new Set(),
  );
  const [commandBarsVisible, setCommandBarsVisible] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [activeFilter, setActiveFilter] = useState<number>(-1);
  const sortedApplications = applications.toSorted(
    (a, b) =>
      new Date(b.applied_at ?? "").getTime() -
      new Date(a.applied_at ?? "").getTime(),
  );

  // make command bars visible when an applicant is selected.
  useEffect(() => {
    setCommandBarsVisible(selectedApplications.size > 0);
  }, [selectedApplications.size]);

  // make api call to update status on button click.
  const updateStatus = async (status: number) => {
    try {
      console.log("Selected applications: ", selectedApplications);
      const updatePromises = Array.from(selectedApplications).map(
        async (id) => {
          const response = await updateApplicationStatus(id, status);
          const application = sortedApplications.find((app) => app.id === id);

          if (application && response.success) {
            onStatusChange(application, status);
          }
        },
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update applications: ", error);
    }
  };

  const statuses = [
    {
      id: "4",
      label: "Accept",
      icon: Check,
      onClick: () => updateStatus(4),
    },
    {
      id: "1",
      label: "Star",
      icon: Star,
      onClick: () => updateStatus(1),
    },
    {
      id: "6",
      label: "Reject",
      icon: X,
      onClick: () => updateStatus(6),
    },
    {
      id: "7",
      label: "Delete",
      icon: Trash,
      onClick: () => updateStatus(7),
      destructive: true,
    },
  ];

  const applyActiveFilter = (apps: typeof sortedApplications) => {
    switch (activeFilter) {
        case 4:
            return apps.filter((application) => application.status === 4);
        case 1:
            return apps.filter((application) => application.status === 1);
        case 6:
            return apps.filter((application) => application.status === 6);
        case 7:
            return apps.filter((application) => application.status === 7);
        default:
            return apps.filter((application) => application.status !== 7);
    }
  };

  const visibleApplications = applyActiveFilter(sortedApplications).filter(
    (application) => 
        application.status !== undefined
  );

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
    setSelectedApplications(
      new Set(sortedApplications.map((application) => application.id!)),
    );
    setAllSelected(true);
  };

  const unselectAll = () => {
    setSelectedApplications(new Set());
    setAllSelected(false);
  };

  const toggleSelectAll = () => {
    allSelected ? unselectAll() : selectAll();
  };

  const getCounts = (apps: EmployerApplication[]) => {
    const counts = {
        all: 0,
        accepted: 0,
        starred: 0,
        rejected: 0,
        deleted: 0
    };

    apps.forEach(app => {
        console.log("application status:" + app.status);
        if (app.status !== 7) counts.all++;
        switch (app.status) {
            case 4: counts.accepted++; break;
            case 1: counts.starred++; break;
            case 6: counts.rejected++; break;
            case 7: counts.deleted++; break;
        }
    });

    return [counts.all, counts.accepted, counts.starred, counts.rejected, counts.deleted];
  }


  return isMobile ? (
    <div className="flex flex-col gap-4">
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={(status: number) => setActiveFilter(status)}
      />
      <CommandMenu
        items={statuses}
        isVisible={commandBarsVisible}
        defaultVisible={true}
        position={{ position: "bottom" }}
      />
      <CommandMenu
        items={[
          {
            id: "select",
            label: "Select all",
            icon: SquareCheck,
            onClick: selectAll,
          },
          selectedApplications.size > 1
            ? `${selectedApplications.size} applicants selected`
            : `${selectedApplications.size} applicant selected`,
          {
            id: "cancel",
            label: "Cancel",
            icon: X,
            onClick: unselectAll,
          },
        ]}
        isVisible={commandBarsVisible}
        defaultVisible={true}
        position={{ position: "top" }}
      />
      <div className="flex flex-col gap-2">
        {visibleApplications.length ? (
            visibleApplications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                onView={() => onApplicationClick(application)}
                onNotes={() => onNotesClick(application)}
                onSchedule={() => onScheduleClick(application)}
                onStatusChange={(status) => onStatusChange(application, status)}
                openChatModal={openChatModal}
                setSelectedApplication={setSelectedApplication}
                updateConversationId={updateConversationId}
                checkboxSelected={selectedApplications.has(application.id!)}
                onToggleSelect={(v) => toggleSelect(application.id!, !!v)}
              />
            ))
        ) : (
          <div className="p-2">
            <Badge>No applications under this category.</Badge>
          </div>
        )}
      </div>
    </div>
  ) : (
    <>
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-200 border-[1px] text-sm rounded-md overflow-hidden">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="p-4">
              <Checkbox 
                onClick={toggleSelectAll}
                checked={selectedApplications.size === sortedApplications.length}
                />
            </th>
            <th className="p-4">Applicant</th>
            <th className="p-4">Education</th>
            <th className="p-4">Crediting</th>
            <th className="p-4">Preferred start</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {visibleApplications.length ? (
            visibleApplications.map((application) => (
                <ApplicationRow
                    key={application.id}
                    application={application}
                    onView={() => onApplicationClick(application)}
                    onNotes={() => onNotesClick(application)}
                    onSchedule={() => onScheduleClick(application)}
                    onStatusChange={(status) =>
                    onStatusChange(application, status)
                    }
                    openChatModal={openChatModal}
                    setSelectedApplication={setSelectedApplication}
                    updateConversationId={updateConversationId}
                    checkboxSelected={selectedApplications.has(application.id!)}
                    onToggleSelect={(v) => toggleSelect(application.id!, !!v)}
                />
            ))
          ) : (
            <div className="p-2">
              <Badge>No applications under this category.</Badge>
            </div>
          )}
        </tbody>
      </table>
    </>
  );
}
