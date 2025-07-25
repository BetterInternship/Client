"use client";

import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { Card } from "@/components/ui/our-card";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useConversations } from "@/hooks/use-conversation";

interface ApplicationsTableProps {
  applications: EmployerApplication[];
  onApplicationClick: (application: EmployerApplication) => void;
  onNotesClick: (application: EmployerApplication) => void;
  onScheduleClick: (application: EmployerApplication) => void;
  onStatusChange: (application: EmployerApplication, status: number) => void;
  openChatModal: () => void;
  updateConversationId: (coversationId: string) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
}

export function ApplicationsTable({
  applications,
  onApplicationClick,
  onNotesClick,
  onScheduleClick,
  onStatusChange,
  openChatModal,
  updateConversationId,
  setSelectedApplication,
}: ApplicationsTableProps) {
  const sortedApplications = applications.toSorted(
    (a, b) =>
      new Date(b.applied_at ?? "").getTime() -
      new Date(a.applied_at ?? "").getTime()
  );
  const conversations = useConversations();

  return (
    <Card className="overflow-auto h-full max-h-full border-none p-0 pt-2">
      <TabGroup>
        <Tab
          indicator={applications
            .filter((application) => application.status === 0)
            .some((application) =>
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id)
              )
            )}
          name="New Applications"
        >
          <table className="relative table-auto border-separate border-spacing-0 w-full h-full max-h-full">
            <tbody className="w-full h-full max-h-full ">
              {sortedApplications.some(
                (application) => application.status === 0
              ) ? (
                sortedApplications
                  .filter((application) => application.status === 0)
                  .map((application) => (
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
                    />
                  ))
              ) : (
                <div className="p-2">
                  <Badge>No applications under this category.</Badge>
                </div>
              )}
            </tbody>
          </table>
        </Tab>
        <Tab
          name="Ongoing Applications"
          indicator={applications
            .filter((application) => application.status === 1)
            .some((application) =>
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id)
              )
            )}
        >
          <table className="relative table-auto border-separate border-spacing-0 w-full max-h-full">
            <tbody className="w-full h-full max-h-full">
              {sortedApplications.some(
                (application) => application.status === 1
              ) ? (
                sortedApplications
                  .filter((application) => application.status === 1)
                  .map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onView={() => onApplicationClick(application)}
                      onNotes={() => onNotesClick(application)}
                      onSchedule={() => onScheduleClick(application)}
                      openChatModal={openChatModal}
                      updateConversationId={updateConversationId}
                      setSelectedApplication={setSelectedApplication}
                      onStatusChange={(status) =>
                        onStatusChange(application, status)
                      }
                    />
                  ))
              ) : (
                <div className="p-2">
                  <Badge>No applications under this category.</Badge>
                </div>
              )}
            </tbody>
          </table>
        </Tab>
        <Tab
          name="Finalized Applications"
          indicator={applications
            .filter(
              (application) =>
                application.status! > 1 && application.status! !== 7
            )
            .some((application) =>
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id)
              )
            )}
        >
          <table className="relative table-auto border-separate border-spacing-0 w-full max-h-full">
            <tbody className="w-full h-full max-h-full">
              {sortedApplications.some(
                (application) =>
                  application.status! > 1 && application.status! !== 7
              ) ? (
                sortedApplications
                  .filter(
                    (application) =>
                      application.status! > 1 && application.status! !== 7
                  )
                  .map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onView={() => onApplicationClick(application)}
                      onNotes={() => onNotesClick(application)}
                      onSchedule={() => onScheduleClick(application)}
                      openChatModal={openChatModal}
                      setSelectedApplication={setSelectedApplication}
                      updateConversationId={updateConversationId}
                      onStatusChange={(status) =>
                        onStatusChange(application, status)
                      }
                    />
                  ))
              ) : (
                <div className="p-2">
                  <Badge>No applications under this category.</Badge>
                </div>
              )}
            </tbody>
          </table>
        </Tab>
        <Tab
          name="Archived Applications"
          indicator={applications
            .filter((application) => application.status! === 7)
            .some((application) =>
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id)
              )
            )}
        >
          <table className="relative table-auto border-separate border-spacing-0 w-full max-h-full">
            <tbody className="w-full h-full max-h-full">
              {sortedApplications.some(
                (application) => application.status! === 7
              ) ? (
                sortedApplications
                  .filter((application) => application.status! === 7)
                  .map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onView={() => onApplicationClick(application)}
                      onNotes={() => onNotesClick(application)}
                      onSchedule={() => onScheduleClick(application)}
                      openChatModal={openChatModal}
                      setSelectedApplication={setSelectedApplication}
                      updateConversationId={updateConversationId}
                      onStatusChange={(status) =>
                        onStatusChange(application, status)
                      }
                    />
                  ))
              ) : (
                <div className="p-2">
                  <Badge>No applications under this category.</Badge>
                </div>
              )}
            </tbody>
          </table>
        </Tab>
      </TabGroup>
    </Card>
  );
}
