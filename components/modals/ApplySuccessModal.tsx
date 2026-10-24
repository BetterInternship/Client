import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@betterinternship/components";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { RefObject } from "react";
import { motion } from "framer-motion";
import { RedditReviewBanner } from "@/components/features/student/job/reddit-review-banner";

export const ApplySuccessModal = ({
  job,
  ref,
}: {
  job: Job | null;
  ref?: RefObject<ModalHandle | null>;
}) => {
  const router = useRouter();

  return (
    <ModalComponent ref={ref}>
      <div className="px-6 pb-8 text-center">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              type: "spring",
              bounce: 0.5,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Application Sent!
          </motion.h2>

          <motion.p
            className="text-gray-600 mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            Your application for{" "}
            <span className="font-semibold max-w-prose text-gray-800">
              {job?.title}
            </span>{" "}
            has been successfully submitted.
          </motion.p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {job?.id && (
            <div className="text-left">
              <RedditReviewBanner key={job.id} job={job} />
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            scheme="default"
            size="sm"
            className="gap-2 font-normal text-gray-500 hover:text-gray-900"
            onClick={() => {
              ref?.current?.close();
              router.push("/applications");
            }}
          >
            View my applications
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.div>
      </div>
    </ModalComponent>
  );
};
