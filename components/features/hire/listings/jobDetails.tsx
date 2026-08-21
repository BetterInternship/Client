"use client";

import { JobDetails } from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { Job } from "@/lib/db/db.types";
import { cn, PageContainer } from "@betterinternship/components";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";

interface JobDetailsPageProps {
  job: Job;
}

const JobDetailsPage = ({ job }: JobDetailsPageProps) => {
  const router = useRouter();
  const { isMobile } = useAppContext();
  const [exitingBack, setExitingBack] = useState(false);

  return (
    <PageContainer>
      <Card>
        {/* Employers share to candidates too — same dialog, same endpoint,
              still a student-domain link (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md D14). */}
        <JobDetails
          job={job}
          actions={[<ShareJobButton key="share" job={job} />]}
        />
      </Card>
    </PageContainer>
  );
};

export default JobDetailsPage;
