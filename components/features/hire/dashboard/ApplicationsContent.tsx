// contains the contents to display the application rows
// rework of ApplicationsTable
"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { Badge } from "@/components/ui/badge";
import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { useAppContext } from "@/lib/ctx-app";
import { useDbRefs } from "@/lib/db/use-refs";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationsHeader } from "./ApplicationsHeader";
import { useState } from "react";
import { CommandMenu } from "@/components/ui/command-menu";
import { Calendar, CheckCircle2, CheckSquare, ContactRound, GraduationCap, ListCheck, SquareCheck, Trash, User2, X } from "lucide-react";
import { useEffect } from "react";
import { updateApplicationStatus } from "@/lib/api/services";
import { statusMap } from "@/components/common/status-icon-map";
import { type ActionItem } from "@/components/ui/action-item";
import { Toast } from "@/components/ui/toast";
import { AnimatePresence, easeOut, motion } from "framer-motion";

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
}

export function ApplicationsContent({
  applications,
  isLoading,
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
  // make command bars visible when an applicant is selected.
  useEffect(() => {
    setCommandBarsVisible(selectedApplications.size > 0);
  }, [selectedApplications.size]);

  // make api call to update status on button click.
  const updateStatus = async (status: number) => {
    const applicationsToUpdate = Array.from(selectedApplications)
      .map((id) => sortedApplications.find((app) => app.id === id))
      .filter((app): app is EmployerApplication => !!app);

      let successfulUpdates = 0;
      let failedUpdates = 0;

    try {
      const updatePromises = applicationsToUpdate.map(async (application) => {
        const response = await updateApplicationStatus(application.id!, status);
        return { response, application };
      });

      const results = await Promise.allSettled(updatePromises);

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.response.success) {
          onStatusChange(result.value.application, status);
          successfulUpdates++;
        } else {
          failedUpdates++;
          if (result.status === 'rejected') {
            console.error("Failed to update application: ", result.reason);
          } else {
            console.warn(`API reported failure: ${result.value.application.id}`);
          }
        }
      })
    } catch (error) {
      console.error("Critical error occurred during status update: ", error);
    } finally {
      unselectAll();

      if (successfulUpdates > 0 && failedUpdates === 0) {
        setToastMessage(`Status of ${successfulUpdates} applicant${successfulUpdates === 1 ? "" : "s"} changed.`);
      } else if (successfulUpdates > 0 && failedUpdates > 0) {
        setToastMessage(`Changed ${successfulUpdates} applicant${successfulUpdates === 1 ? "" : "s"} and failed to change ${failedUpdates} applicant${successfulUpdates === 1 ? "" : "s"}.`);
      } else if (failedUpdates > 0) {
        setToastMessage(`Failed to change ${failedUpdates} applicant${successfulUpdates === 1 ? "" : "s"}. Please try again later.`);
      } else {
        return;
      }

      setToastVisible(true);
    }
  };

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

  const unique_app_statuses = app_statuses.reduce(
    (acc: {id: number, name: string}[], cur: {id: number, name: string}) => 
      (acc.find(a => a.name === cur.name) ? acc : [...acc, cur]), []
  );
  
  const statuses = unique_app_statuses
    .map((status): ActionItem => {
      const uiProps = statusMap.get(status.id);

      return {
        id: status.id.toString(),
        label: status.name,
        icon: uiProps?.icon,
        onClick: () => updateStatus(status.id),
        destructive: uiProps?.destructive,
      };
    })
    .filter(Boolean);

    // get statuses specifically for the rows. these use different action items.
    const getRowStatuses = (applicationId: string) => {
      return unique_app_statuses
        .filter((status) => status.id !== 7 && status.id !== 0)
        .map((status): ActionItem => {
          const uiProps = statusMap.get(status.id);
          return {
            id: status.id.toString(),
            label: status.name,
            icon: uiProps?.icon,
            onClick: () => updateSingleStatus(applicationId, status.id),
            destructive: uiProps?.destructive,
          };
        });
    };

  // remove the delete item from the bottom command bar so we can put it in the top one and the pending status.
  const remove_unused_statuses = statuses.filter((status) => status.id !== "7" &&
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

  
  const numVisibleSelected = visibleApplications.filter(app =>
    selectedApplications.has(app.id!)
  ).length;

  const allVisibleSelected = visibleApplications.length > 0 &&
                             numVisibleSelected === visibleApplications.length;

  const someVisibleSelected = numVisibleSelected > 0 && numVisibleSelected < visibleApplications.length;

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
      new Set(visibleApplications.map((application) => application.id!))
    )
  };

  const unselectAll = () => {
    setSelectedApplications(new Set());
  };

  const toggleSelectAll = () => {
    allVisibleSelected ? unselectAll() : selectAll();
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
    <div className="flex flex-col gap-2 min-h-screen">
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
      <AnimatePresence>
        {commandBarsVisible && (
          <>
            <motion.div
              className="fixed bottom-4 z-[1000] shadow-xl w-max"
              initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
              animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%" }}
              exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ left: "50%" }}
            >
              <CommandMenu
                buttonLayout="vertical"
                items={remove_unused_statuses}
              />
            </motion.div>
            <motion.div
              className="fixed top-20 z-[1000] shadow-xl w-max mx-2"
              initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
              animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%" }}
              exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ left: "50%" }}
            >
              <CommandMenu
                buttonLayout="vertical"
                items={[
                  [
                    {
                      id: "cancel",
                      icon: X,
                      onClick: unselectAll,
                    },
                    `${selectedApplications.size} selected`,
                  ],
                  [
                    {
                      id: "select_all",
                      label: allVisibleSelected ? "Unselect all" : "Select all" ,
                      icon: CheckSquare,
                      onClick: toggleSelectAll,
                    },
                    {
                      id: "delete",
                      label: "Delete",
                      icon: Trash,
                      destructive: true,
                      onClick: () => updateStatus(7),
                    },
                  ],
                ]}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
              onStatusButtonClick={updateSingleStatus}
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
      <AnimatePresence>
        {commandBarsVisible && (
          <>
          <motion.div
            className="fixed bottom-4 z-[1000] shadow-xl w-max"
            initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1, x: "-50%", backdropFilter: "blur(50%)" }}
            exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ left: "50%" }}
          >
            <CommandMenu
              items={[
                [
                  {
                    id: "cancel",
                    icon: X,
                    onClick: unselectAll,
                  },
                  `${selectedApplications.size} selected`,
                ],
                remove_unused_statuses,
                [
                  {
                    id: "select_all",
                    label: allVisibleSelected ? "Unselect all" : "Select all" ,
                    icon: CheckSquare,
                    onClick: toggleSelectAll,
                  },
                  {
                    id: "delete",
                    label: "Delete",
                    icon: Trash,
                    destructive: true,
                    onClick: () => updateStatus(7),
                  },
                ],
              ]}
            />
          </motion.div>
        </>
        )}
      </AnimatePresence>
      {isLoading ? (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Applicants...</p>
            </div>
          </div>
      ) : (
        <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-200 border text-sm rounded-md overflow-visible">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">
                <Checkbox
                  onClick={toggleSelectAll}
                  checked={
                    allVisibleSelected 
                    ? true
                    : someVisibleSelected
                      ? 'indeterminate'
                      : false
                  }
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
                  <span>Preferred start</span>
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
                  onStatusButtonClick={updateSingleStatus}
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
}
