import { motion } from "framer-motion"
import { motionVariants } from "@/lib/animations"

interface SectionHeaderProps {
  subtitle?: string
  title: string
  description?: string
  customSubtitle?: string
  delay?: number
}

export function SectionHeader({ subtitle, title, description, customSubtitle, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      {subtitle && (
        <div className="text-sm text-green-400 mb-4 font-medium">{subtitle}</div>
      )}
      {customSubtitle && (
        <div className="text-sm text-green-400 mb-8">{customSubtitle}</div>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  )
}
