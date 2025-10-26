// contains the contents to display the application rows
// rework of ApplicationsTable
"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { useAppContext } from "@/lib/ctx-app";
import { Card } from "@/components/ui/card";

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
    setSelectedApplication
}: ApplicationsContentProps) {
    const { isMobile } = useAppContext();
    const sortedApplications = applications.toSorted(
        (a, b) =>
            new Date(b.applied_at ?? "").getTime() -
            new Date(a.applied_at ?? "").getTime()
    );

    return isMobile ? (
        <>
            <Card>

            </Card>
        </>
    ) : (
        <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-300 border-2 p-2 rounded-md">
            <thead className="bg-gray-100">
                <tr className="text-left">
                    <th className="p-2">Applicant</th>
                    <th className="p-2">Education</th>
                    <th className="p-2">Crediting</th>
                    <th className="p-2">Preferred start</th>
                    <th className="p-2"></th>
                </tr>
            </thead>
            <tbody>
                {sortedApplications.some(
                    (application) => application.status !== undefined && statusId.includes(application.status)
                ) ? (
                    sortedApplications
                        .filter((application) => application.status !== undefined && statusId.includes(application.status))
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
    );
}