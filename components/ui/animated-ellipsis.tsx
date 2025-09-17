import { motion } from "framer-motion";

const AnimatedEllipsis = () => {
  return (
    <div className="flex justify-center items-end self-end gap-1">
      <motion.span
        className="block w-2 h-2 bg-[#1E293B] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0,
          duration: 0.33,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.1,
        }}
      />
      <motion.span
        className="block w-2 h-2 bg-[#1E293B] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.05,
          duration: 0.33,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.1,
        }}
      />
      <motion.span
        className="block w-2 h-2 bg-[#1E293B] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.1,
          duration: 0.33,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.1,
        }}
      />
    </div>
  );
};

export default AnimatedEllipsis;
