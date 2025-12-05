"use client";

import { statusMap } from "@/components/common/status-icon-map";
import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicantPage } from "@/components/features/hire/dashboard/ApplicantPage";
import { type ActionItem } from "@/components/ui/action-item";
import { useEmployerApplications } from "@/hooks/use-employer-api";
import { updateApplicationStatus, UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ApplicantPageContent () {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [userData, setUserData] = useState<EmployerApplication | undefined>(undefined)
    const [loading, setLoading] = useState(true);
    const applications = useEmployerApplications();
    const userApplication = applications?.employer_applications.find(a => userId === a.user_id)
    const otherApplications = applications?.employer_applications.filter(a => userId === a.user_id && a.id !== userApplication?.id)
    const { app_statuses } = useDbRefs();

    useEffect(() => {
        const fetchUserData = async() => {
            if(!userId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await UserService.getUserById(userId); //change
                console.log(response)
                if(response?.success && response.users){
                    setUserData(userApplication)
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }            
        };
        fetchUserData();
    }, [userId]);

    if (!app_statuses) return null;

    const unique_app_statuses = app_statuses.reduce(
    (acc: {id: number, name: string}[], cur: {id: number, name: string}) =>
        (acc.find(a => a.name === cur.name) ? acc : [...acc, cur]), []
    );

    const getStatuses = (applicationId: string) => {
      return unique_app_statuses
        .filter((status) => status.id !== 7 && status.id !== 0)
        .map((status): ActionItem => {
          const uiProps = statusMap.get(status.id);
          return {
            id: status.id.toString(),
            label: status.name,
            icon: uiProps?.icon,
            onClick: () => updateApplicationStatus(applicationId, status.id),
            destructive: uiProps?.destructive,
          };
        });
    };

    return (
        <ContentLayout>
            <div className="w-full h-full">
                <ApplicantPage 
                application={userApplication}
                statuses={getStatuses(userApplication?.id || "")}
                userApplications={otherApplications}
                />
            </div>
        </ContentLayout>
    )
}

export default function ApplicantInfo () {
    return(
        <Suspense>
            <ApplicantPageContent/>
        </Suspense>
    )
}