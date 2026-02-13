"use client";

import { motion } from "framer-motion";

export function CheckeredFinishFlag() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.95 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full h-16 sm:h-20 md:h-24 mb-6 rounded-lg overflow-hidden drop-shadow-2xl"
      style={{
        backgroundImage: `
          linear-gradient(45deg, #000 25%, transparent 25%),
          linear-gradient(-45deg, #000 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #000 75%),
          linear-gradient(-45deg, transparent 75%, #000 75%)
        `,
        backgroundSize: "40px 40px",
        backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Shine sweep - same tempo as shiny text */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}
