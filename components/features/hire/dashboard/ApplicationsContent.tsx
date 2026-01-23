// contains the contents to display the application rows
// rework of ApplicationsTable
"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useApplicationSelection } from "@/hooks/use-application-selection";
import { Badge } from "@/components/ui/badge";
import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { useAppContext } from "@/lib/ctx-app";
import { useDbRefs } from "@/lib/db/use-refs";
import { ApplicationsHeader } from "./ApplicationsHeader";
import { useState } from "react";
import { Calendar, CheckCircle2, CheckSquare, ContactRound, GraduationCap, ListCheck, SquareCheck, Trash, User2, X } from "lucide-react";
import { useEffect } from "react";
import { updateApplicationStatus } from "@/lib/api/services";
import { statusMap } from "@/components/common/status-icon-map";
import { type ActionItem } from "@/components/ui/action-item";
import { Toast } from "@/components/ui/toast";
import { ApplicationsCommandBar } from "./ApplicationsCommandBar";
import { FormCheckbox } from "@/components/EditForm";

interface ApplicationsContentProps {
  applications: EmployerApplication[];
  statusId: number[];
  isLoading?: boolean;
  openChatModal: () => void;
  updateConversationId: (userId: string) => void;
  onApplicationClick: (application: EmployerApplication) => void;
  onNotesClick: (application: EmployerApplication) => void;
  onScheduleClick: (application: EmployerApplication) => void;
  onStatusChange: (application: EmployerApplication, status: number) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
  onRequestArchiveApplicant: (application: EmployerApplication) => void;
  onRequestDeleteApplicant: (application: EmployerApplication) => void;
  onRequestStatusChange: (applications: EmployerApplication[], status: number) => void;
  applicantToDelete: EmployerApplication | null;
  applicantToArchive: EmployerApplication | null;
}

export const ApplicationsContent = forwardRef<
  { unselectAll: () => void },
  ApplicationsContentProps
>(function ApplicationsContent({
  applications,
  isLoading,
  openChatModal,
  updateConversationId,
  onApplicationClick,
  onNotesClick,
  onScheduleClick,
  onStatusChange,
  setSelectedApplication,
  onRequestDeleteApplicant,
  onRequestArchiveApplicant,
  onRequestStatusChange,
  applicantToArchive,
  applicantToDelete,
}, ref) {
  const { isMobile } = useAppContext();

  const [commandBarsVisible, setCommandBarsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<number>(-1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const sortedApplications = applications.toSorted(
    (a, b) =>
      new Date(b.applied_at ?? "").getTime() -
      new Date(a.applied_at ?? "").getTime(),
  );

  const { app_statuses } = useDbRefs();

  useEffect(() => {
    if (toastVisible) {
      const timeoutId = setTimeout(() => {
      setToastVisible(false);
    }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [toastVisible]);

  const updateSingleStatus = async (id: string, status: number) => {
    const application = sortedApplications.find((a) => a.id === id);

    if (!application) return;
    
    try {
      const response = await updateApplicationStatus(id, status);

      if (response) {
        onStatusChange(application, status);
        setToastMessage(`Applicant status changed.`);
        setToastVisible(true);
      }
    } catch (error) {
      console.error("Critical error occurred during status update: ", error);
    }
  }

  if (!app_statuses) return null;

  const statuses = app_statuses
    .map((status): ActionItem => {
      const uiProps = statusMap.get(status.id);

      return {
        id: status.id.toString(),
        label: status.name,
        icon: uiProps?.icon,
        onClick: () => {
          const applicationsToUpdate = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .filter((app): app is EmployerApplication => !!app);
          
          onRequestStatusChange(applicationsToUpdate, status.id);
        },
        destructive: uiProps?.destructive,
        highlightColor: uiProps?.fgColor,
        bgColor: uiProps?.bgColor,
        fgColor: uiProps?.fgColor,
      };
    }
  ).filter(Boolean);

  // get statuses specifically for the rows. these use different action items.
  const getRowStatuses = (applicationId: string) => {
    return app_statuses
      .filter((status) => status.id !== 7 && status.id !== 5 && status.id !== 0)
      .map((status): ActionItem => {
        const uiProps = statusMap.get(status.id);
        return {
          id: status.id.toString(),
          label: status.name,
          icon: uiProps?.icon,
          onClick: () => updateSingleStatus(applicationId, status.id),
          destructive: uiProps?.destructive,
          bgColor: uiProps?.bgColor,
          fgColor: uiProps?.fgColor,
        };
      });
  };

  // remove the delete item from the bottom command bar so we can put it in the top one and the pending status.
  const remove_unused_statuses = statuses.filter((status) => status.id !== "5" &&
                                                             status.id !== "0");

  const applyActiveFilter = (apps: typeof sortedApplications) => {
    if (activeFilter === -1) {
      return apps.filter((application) => application.status !== 7);
    }

    return apps.filter((application) => application.status === activeFilter);
  };

  const visibleApplications = applyActiveFilter(sortedApplications).filter(
    (application) => application.status !== undefined,
  );
  
  const {
    selectedApplications,
    toggleSelect,
    selectAll,
    unselectAll,
    toggleSelectAll,
  } = useApplicationSelection(visibleApplications);

  useImperativeHandle(ref, () => ({
    unselectAll,
  }));

  const numVisibleSelected = visibleApplications.filter(app =>
    selectedApplications.has(app.id!)
  ).length;

  const allVisibleSelected = visibleApplications.length > 0 &&
                             numVisibleSelected === visibleApplications.length;

  const someVisibleSelected = numVisibleSelected > 0 && numVisibleSelected < visibleApplications.length;

  // make command bars visible when an applicant is selected.
  useEffect(() => {
    setCommandBarsVisible(selectedApplications.size > 0);
  }, [selectedApplications.size]);

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
    <div className="flex flex-col gap-2 min-h-screen">
      <Toast
        visible={toastVisible}
        title={toastMessage}
        indicator={<CheckCircle2 />}
        className="top-6 z-[1000]"
      />
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={(status: number) => {
          setActiveFilter(status)
          unselectAll()
        }}
      />
      <ApplicationsCommandBar
        visible={commandBarsVisible}
        selectedCount={selectedApplications.size}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        visibleApplicationsCount={visibleApplications.length}
        statuses={remove_unused_statuses}
        onUnselectAll={unselectAll}
        onSelectAll={selectAll}
        onDelete={() => {
          const appToDelete = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .find((app): app is EmployerApplication => !!app);
          if (appToDelete) onRequestDeleteApplicant(appToDelete);
        }}
        onStatusChange={() => {}}
      />
      <div className="flex flex-col gap-2">
        {visibleApplications.length ? (
          visibleApplications.map((application, index) => (
            <ApplicationRow
              key={application.id}
              index={index}
              application={application}
              onView={(v) => {
                if (selectedApplications.size === 0) {
                  onApplicationClick(application)
                } else {
                  toggleSelect(application.id!, v)
                }
              }}
              onNotes={() => onNotesClick(application)}
              onSchedule={() => onScheduleClick(application)}
              onStatusChange={(status) => onStatusChange(application, status)}
              openChatModal={openChatModal}
              setSelectedApplication={setSelectedApplication}
              updateConversationId={updateConversationId}
              checkboxSelected={selectedApplications.has(application.id!)}
              onToggleSelect={(v) => toggleSelect(application.id!, v)}
              onArchiveButtonClick={onRequestArchiveApplicant}
              onDeleteButtonClick={onRequestDeleteApplicant}
              statuses={getRowStatuses(application.id!)}
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
    <div className="flex flex-col gap-2">
      <Toast
        visible={toastVisible}
        title={toastMessage}
        indicator={<CheckCircle2 />}
      />
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={(status: number) => {
          setActiveFilter(status)
          unselectAll()
        }}
      />
      <ApplicationsCommandBar
        visible={commandBarsVisible}
        selectedCount={selectedApplications.size}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        visibleApplicationsCount={visibleApplications.length}
        statuses={remove_unused_statuses}
        onUnselectAll={unselectAll}
        onSelectAll={selectAll}
        onDelete={() => {
          const appToDelete = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .find((app): app is EmployerApplication => !!app);
          if (appToDelete) onRequestDeleteApplicant(appToDelete);
        }}
        onStatusChange={() => {}}
      />
      {isLoading ? (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Applicants...</p>
            </div>
          </div>
      ) : (
        <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-200 border text-sm rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th 
                className="p-4"
                onClick={toggleSelectAll}
              >
                <FormCheckbox
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  setter={toggleSelectAll}
                  disabled={visibleApplications.length === 0}
                />
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <User2 size={16} />
                  <span>Applicant</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Education</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <ContactRound size={16} />
                  <span>Crediting</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Expected start date</span>
              </div>
            </th>
            <th className="p-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Date applied</span>
                </div>
              </th>
              <th className="p-4">
                <div className="flex items-center gap-2">
                  <ListCheck size={16} />
                  <span>Status</span>
                </div>
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {visibleApplications.length ? (
              visibleApplications.map((application, index) => (
                <ApplicationRow
                  key={application.id}
                  index={index}
                  application={application}
                  onView={(v) => {
                  if (selectedApplications.size === 0) {
                    onApplicationClick(application)
                  } else {
                    toggleSelect(application.id!, v)
                  }
                }}
                  onNotes={() => onNotesClick(application)}
                  onSchedule={() => onScheduleClick(application)}
                  onStatusChange={(status) => onStatusChange(application, status)}
                  openChatModal={openChatModal}
                  setSelectedApplication={setSelectedApplication}
                  updateConversationId={updateConversationId}
                  checkboxSelected={selectedApplications.has(application.id!)}
                  onToggleSelect={(v) => toggleSelect(application.id!, v)}
                  onArchiveButtonClick={() => onRequestArchiveApplicant?.(application)}
                  onDeleteButtonClick={() => onRequestDeleteApplicant?.(application)}
                  statuses={getRowStatuses(application.id!)}
                />
              ))
          ) : (
            <tr>
              <td>
                <Badge className="m-2">No applications under this category.</Badge>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      )}
    </div>
  );
});