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
import { ElementType, useState } from "react";
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

  const { to_app_status_name, get_app_status, app_statuses } = useDbRefs();

  console.log(app_statuses);

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

  type StatusUIProps = {
    icon: ElementType;
    destructive?: boolean;
  };

  const statusUIMap: Record<number, StatusUIProps> = {
    1: { icon: Star },
    4: { icon: Check },
    6: { icon: X },
    7: { icon: Trash, destructive: true },
  };

  const unique_app_statuses = [
    ...new Map(app_statuses.map((status) => [status.id, status])).values(),
  ];

  const statuses = unique_app_statuses
    .map((status) => {
      const uiProps = statusUIMap[status.id];

      if (!uiProps) return null;

      return {
        id: status.id.toString(),
        label: status.name,
        icon: uiProps.icon,
        destructive: uiProps?.destructive,
        onClick: () => updateStatus(status.id),
      };
    })
    .filter(Boolean);

  const applyActiveFilter = (apps: typeof sortedApplications) => {
    if (activeFilter === -1) {
      return apps.filter((application) => application.status !== 7);
    }

    return apps.filter((application) => application.status === activeFilter);
  };

  const visibleApplications = applyActiveFilter(sortedApplications).filter(
    (application) => application.status !== undefined,
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
    const counts: Record<string | number, number> = { all: 0 };

    statuses.forEach((status) => {
      counts[status?.id || 0] = 0;
    });

    apps.forEach((app) => {
      const statusId = app.status;

      if (statusId !== 7) {
        counts.all++;
      }

      if (statusId !== undefined && Object.hasOwn(counts, statusId)) {
        counts[statusId]++;
      }
    });

    return counts;
  };

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
                checked={
                  selectedApplications.size === sortedApplications.length
                }
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
        </tbody>
      </table>
    </>
  );
}
