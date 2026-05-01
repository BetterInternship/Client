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
import {
  Archive,
  ArchiveRestore,
  Calendar,
  ContactRound,
  GraduationCap,
  ListCheck,
  Trash2,
  User2,
} from "lucide-react";
import { useEffect } from "react";
import {
  DB_STATUS_MAP,
  UI_STATUS_MAP,
  ApplicationAction,
  ApplicationFilter,
} from "@/lib/consts/application";
import { type ActionItem } from "@/components/ui/action-item";
import { ApplicationsCommandBar } from "./ApplicationsCommandBar";
import { FormCheckbox } from "@/components/EditForm";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

interface ApplicationsContentProps {
  applications: EmployerApplication[];
  isSuperListing?: boolean;
  statusId: number[];
  isLoading?: boolean;
  openChatModal: () => void;
  onApplicationClick: (application: EmployerApplication) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
  onAction: (
    type: ApplicationAction,
    apps: EmployerApplication[],
    status?: number,
  ) => void;
  applicantToDelete: EmployerApplication | null;
  applicantToArchive: EmployerApplication | null;
}

export const ApplicationsContent = forwardRef<
  { unselectAll: () => void },
  ApplicationsContentProps
>(function ApplicationsContent(
  {
    applications,
    isSuperListing = false,
    isLoading,
    openChatModal,
    onApplicationClick,
    setSelectedApplication,
    onAction,
  },
  ref,
) {
  const { isMobile } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("jobId");

  const [commandBarsVisible, setCommandBarsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>("all");
  const sortedApplications = applications.toSorted(
    (a, b) =>
      new Date(b.applied_at ?? "").getTime() -
      new Date(a.applied_at ?? "").getTime(),
  );

  const { app_statuses, get_app_status } = useDbRefs();

  if (!app_statuses) return null;

  const statuses = app_statuses
    .map((status): ActionItem => {
      // look up config for db id
      const config = DB_STATUS_MAP[status.id];

      // get ui properties using mapped key
      const filterKey =
        config?.key || (status.name.toLowerCase() as ApplicationFilter);
      const uiProps = UI_STATUS_MAP.get(filterKey);

      return {
        id: status.id.toString(),
        label: status.name,
        icon: uiProps?.icon,
        onClick: () => {
          const applicationsToUpdate = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .filter((app): app is EmployerApplication => !!app);

          onAction(
            config.action || "CHANGE_STATUS",
            applicationsToUpdate,
            status.id,
          );
        },
        destructive: uiProps?.destructive,
        highlightColor: uiProps?.fgColor,
        bgColor: uiProps?.bgColor,
        fgColor: uiProps?.fgColor,
      };
    })
    .filter(Boolean);

  // get statuses specifically for the rows. these use different action items.
  const getRowStatuses = (application: EmployerApplication) => {
    return app_statuses
      .filter((status) => status.id !== 7 && status.id !== 5 && status.id !== 0)
      .map((status): ActionItem => {
        const config = DB_STATUS_MAP[status.id];
        const filterKey =
          config?.key || (status.name.toLowerCase() as ApplicationFilter);
        const uiProps = UI_STATUS_MAP.get(filterKey);

        const handleClick = () => {
          onAction(config.action || "CHANGE_STATUS", [application], status.id);
        };

        return {
          id: status.id.toString(),
          label: status.name,
          icon: uiProps?.icon,
          onClick: handleClick,
          destructive: uiProps?.destructive,
          bgColor: uiProps?.bgColor,
          fgColor: uiProps?.fgColor,
        };
      });
  };

  const applyActiveFilter = (apps: typeof sortedApplications) => {
    if (activeFilter === "archived")
      return apps.filter((app) => app.visibility === "archived");

    const activeApps = apps.filter((app) => app.visibility === "visible");

    switch (activeFilter) {
      case "all":
        return activeApps.filter(
          (app) =>
            app.visibility !== "archived" && app.visibility !== "deleted",
        );
      case "pending":
        return activeApps.filter((app) => app.status === 0);
      case "shortlisted":
        return activeApps.filter((app) => app.status === 1);
      case "accepted":
        return activeApps.filter((app) => app.status === 4);
      case "rejected":
        return activeApps.filter((app) => app.status === 6);
      default:
        return activeApps;
    }
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

  const numVisibleSelected = visibleApplications.filter((app) =>
    selectedApplications.has(app.id!),
  ).length;

  const allVisibleSelected =
    visibleApplications.length > 0 &&
    numVisibleSelected === visibleApplications.length;

  const someVisibleSelected =
    numVisibleSelected > 0 && numVisibleSelected < visibleApplications.length;

  // separate statuses and visibility in the command bar and remove unused ones.
  const command_bar_statuses = statuses.filter(
    (status) => status.id !== "5" && status.id !== "7" && status.id !== "0",
  );

  const command_bar_visibility: ActionItem[] = [
    {
      id: "archive",
      label: activeFilter === "archived" ? "Unarchive" : "Archive",
      icon: activeFilter === "archived" ? ArchiveRestore : Archive,
      onClick: () => {
        const apps = Array.from(selectedApplications)
          .map((id) => sortedApplications.find((app) => app.id === id))
          .filter((app): app is EmployerApplication => !!app);

        if (apps.length > 0) {
          onAction(activeFilter === "archived" ? "UNARCHIVE" : "ARCHIVE", apps);
          unselectAll();
        }
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      destructive: true,
      onClick: () => {
        const apps = Array.from(selectedApplications)
          .map((id) => sortedApplications.find((app) => app.id === id))
          .filter((app): app is EmployerApplication => !!app);

        if (apps.length > 0) {
          onAction("DELETE", apps);
          unselectAll();
        }
      },
    },
  ];

  // make command bars visible when an applicant is selected.
  useEffect(() => {
    setCommandBarsVisible(selectedApplications.size > 0);
  }, [selectedApplications.size]);

  // get number of applications under each filter.
  const getCounts = (apps: EmployerApplication[]) => {
    const counts: Record<ApplicationFilter | number, number> = {
      all: 0,
      pending: 0,
      accepted: 0,
      shortlisted: 0,
      rejected: 0,
      archived: 0,
    };

    apps.forEach((app) => {
      // don't count deleted applications.
      if (app.visibility === "deleted") return;

      // only count archived applications within its own tab (not included in all).
      if (app.visibility === "archived") {
        counts.archived++;
        return;
      }

      // if neither of the above, include in all count.
      counts.all++;
      switch (app.status) {
        case 0:
          counts.pending++;
          break;
        case 1:
          counts.shortlisted++;
          break;
        case 4:
          counts.accepted++;
          break;
        case 6:
          counts.rejected++;
          break;
      }
    });

    return counts;
  };

  return isMobile ? (
    <div className="flex flex-col gap-2 min-h-screen mb-28">
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={(filter: ApplicationFilter) => {
          setActiveFilter(filter);
          unselectAll();
        }}
      />
      <ApplicationsCommandBar
        visible={commandBarsVisible}
        selectedCount={selectedApplications.size}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        visibleApplicationsCount={visibleApplications.length}
        statuses={command_bar_statuses}
        applicationVisibility={command_bar_visibility}
        onUnselectAll={unselectAll}
        onSelectAll={selectAll}
        onDelete={() => {
          const appToDelete = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .find((app): app is EmployerApplication => !!app);
          if (appToDelete) onAction("DELETE", [appToDelete]);
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
              isSuperListing={isSuperListing}
              onView={(v) => {
                if (selectedApplications.size === 0) {
                  onApplicationClick(application);
                } else {
                  toggleSelect(application.id!, v);
                }
              }}
              setSelectedApplication={setSelectedApplication}
              checkboxSelected={selectedApplications.has(application.id!)}
              onToggleSelect={(v) => toggleSelect(application.id!, v)}
              onAction={onAction}
              statuses={getRowStatuses(application)}
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
    <div className="flex flex-col gap-2 mb-28">
      <ApplicationsHeader
        selectedCounts={getCounts(sortedApplications)}
        activeFilter={activeFilter}
        onFilterChange={(filter: ApplicationFilter) => {
          setActiveFilter(filter);
          unselectAll();
        }}
      />
      <ApplicationsCommandBar
        visible={commandBarsVisible}
        selectedCount={selectedApplications.size}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        visibleApplicationsCount={visibleApplications.length}
        statuses={command_bar_statuses}
        applicationVisibility={command_bar_visibility}
        onUnselectAll={unselectAll}
        onSelectAll={selectAll}
        onDelete={() => {
          const appToDelete = Array.from(selectedApplications)
            .map((id) => sortedApplications.find((app) => app.id === id))
            .find((app): app is EmployerApplication => !!app);
          if (appToDelete) onAction("DELETE", [appToDelete]);
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
        <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-200 border text-sm rounded-[0.33em] overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4" onClick={toggleSelectAll}>
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
              {isSuperListing ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
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
                  isSuperListing={isSuperListing}
                  onView={(v) => {
                    if (selectedApplications.size === 0) {
                      onApplicationClick(application);
                    } else {
                      toggleSelect(application.id!, v);
                    }
                  }}
                  setSelectedApplication={setSelectedApplication}
                  checkboxSelected={selectedApplications.has(application.id!)}
                  onToggleSelect={(v) => toggleSelect(application.id!, v)}
                  onAction={onAction}
                  statuses={getRowStatuses(application)}
                />
              ))
            ) : (
              <tr>
                <td>
                  <Badge className="m-2">
                    No applications under this category.
                  </Badge>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
});
