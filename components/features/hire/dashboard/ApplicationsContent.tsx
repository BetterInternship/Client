// contains the contents to display the application rows
// rework of ApplicationsTable
"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication } from "@/lib/db/db.types";
import { ApplicationRow } from "./ApplicationRow";
import { useAppContext } from "@/lib/ctx-app";
import { useDbRefs } from "@/lib/db/use-refs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationsHeader } from "./ApplicationsHeader";
import { useState } from "react";

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
    const { to_app_status_name } = useDbRefs();
    const { isMobile } = useAppContext();
    const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
    const sortedApplications = applications.toSorted(
        (a, b) =>
            new Date(b.applied_at ?? "").getTime() -
            new Date(a.applied_at ?? "").getTime()
    );

    const test = (on: boolean) => {
        console.log(test, on);
    }

    return isMobile ? (
        <div className="flex flex-col gap-2">
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
        </div>
    ) : (
        <>
            <ApplicationsHeader
                selectedCount={sortedApplications.length}
                onStatusChange={test}
            />
            <table className="relative table-auto border-separate border-spacing-0 w-full bg-white border-gray-300 border-2 text-sm rounded-md overflow-hidden">
                <div>
                </div>
                <thead className="bg-gray-100">
                    <tr className="text-left">
                        <th className="p-4">
                            <Checkbox></Checkbox>
                        </th>
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Education</th>
                        <th className="p-4">Crediting</th>
                        <th className="p-4">Preferred start</th>
                        <th className="p-4"></th>
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
        </>
    );
}