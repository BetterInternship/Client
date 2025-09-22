import { motion } from "framer-motion";
import { AnimatedShinyText } from "../../../ui/animated-shiny-text";

export const ProcessingTransition = ({
  promise,
  onComplete,
}: {
  promise?: Promise<any>;
  onComplete: () => void;
}) => {
  const widths = [0, 100];
  for (let i = 0; i < 14; i++) widths.push(Math.random() * 100);
  widths.sort((a, b) => a - b);

  return (
    <motion.div
      className="flex flex-col items-center p-8 w-full max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="relative flex flex-row w-full mb-4 justify-center">
        <img src="/resume-loader.gif" className="aspect-auto w-60" />
      </div>
      <div className="w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#23649D] to-[#81B4BA] rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: widths.map((width) => `${width}%`),
          }}
          transition={{
            duration: 7.5,
            ease: "easeInOut",
            times: [
              0.0457, 0.2289, 0.2387, 0.2453, 0.2771, 0.3567, 0.4316, 0.4379,
              0.5143, 0.5614, 0.7169, 0.7282, 0.8133, 0.882, 0.9266, 0.945,
            ],
          }}
          onAnimationComplete={() =>
            promise?.then(onComplete).catch(onComplete) ?? onComplete()
          }
        />
      </div>
      <h1 className="text-xl font-normal text-gray-700 mt-4">
        <AnimatedShinyText>processing your resume...</AnimatedShinyText>
      </h1>
    </motion.div>
  );
};

export default ProcessingTransition;
