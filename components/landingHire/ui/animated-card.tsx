import { motion, type MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0, ...motionProps }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      viewport={{ once: true }}
      className={cn("bg-gray-900 border border-gray-800 rounded-2xl p-6", className)}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}
