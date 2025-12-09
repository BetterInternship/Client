"use client"

import { JobDetails } from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface JobDetailsPageProps {
  job: Job;
};

const JobDetailsPage = ({
  job,
}: JobDetailsPageProps) => {
  const router = useRouter();
  const { isMobile } = useAppContext();
  const [exitingBack, setExitingBack] = useState(false);

  const handleBack = () => {
    setExitingBack(true);
    router.push(`/dashboard/manage?jobId=${job.id}`)
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={exitingBack ? { scale: 0.98, filter: "blur(4px)", opacity: 0 } : { scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "py-2",
          isMobile ? "px-1" : ""
        )}
      >
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
        >
          <ArrowLeft className="s-8" />
        </button>
        <Card>
          <JobDetails
            job={job}
          />
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default JobDetailsPage;