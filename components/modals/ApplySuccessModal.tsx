import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { Clipboard, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { RefObject } from "react";
import { motion } from "framer-motion";

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
          <Button
            onClick={() => {
              ref?.current?.close();
              router.push("/applications");
            }}
          >
            <Clipboard className="w-4 h-4 mr-2" />
            View My Applications
          </Button>
        </motion.div>
      </div>
    </ModalComponent>
  );
};
