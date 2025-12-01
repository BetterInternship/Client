"use client";

import { ApplicantPage } from "@/components/features/hire/dashboard/ApplicantPage"
import ContentLayout from "@/components/features/hire/content-layout";
import { EmployerApplication, InternshipPreferences } from "@/lib/db/db.types";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserService } from "@/lib/api/services";
import { useEmployerApplications } from "@/hooks/use-employer-api"

function ApplicantPageContent () {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [userData, setUserData] = useState<EmployerApplication | undefined>(undefined)
    const [loading, setLoading] = useState(true);
    const applications = useEmployerApplications();
    const userApplication = applications?.employer_applications.find(a => userId === a.user_id)

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
    }, [userId])

    return (
        <ContentLayout>
            <div className="w-full h-full">
                <ApplicantPage application={userApplication} />
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