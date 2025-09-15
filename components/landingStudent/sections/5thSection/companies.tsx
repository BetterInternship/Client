"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface Logo {
  id: number;
  name: string;
  src: string;
}

interface LogoColumnProps {
  logos: Logo[];
  columnIndex: number;
  currentTime: number;
}

function LogoColumn({ logos, columnIndex, currentTime }: LogoColumnProps) {
  const CYCLE_DURATION = 5000;
  const columnDelay = columnIndex * 200;
  const adjustedTime = (currentTime + columnDelay) % (CYCLE_DURATION * logos.length);
  const currentIndex = Math.floor(adjustedTime / CYCLE_DURATION);
  const currentLogo = logos[currentIndex];

  return (
    <motion.div
      className="relative h-14 w-24 overflow-hidden md:h-24 md:w-48"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: columnIndex * 0.1,
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentLogo.id}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: "10%", opacity: 0 }}
          animate={{
            y: "0%",
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
          }}
          exit={{
            y: "-20%",
            opacity: 0,
            transition: { duration: 0.3 },
          }}
        >
          <Image
            src={currentLogo.src}
            alt={currentLogo.name}
            width={160}
            height={60}
            className="h-auto w-auto max-h-[80%] max-w-[80%] object-contain"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================ MOBILE (2×2 grid) ============================ */

function LogoTile({
  logos,
  slot,
  currentTime,
}: {
  logos: Logo[];
  slot: number; // 0..3
  currentTime: number;
}) {
  const CYCLE_DURATION = 4500;
  const base = Math.floor(
    (currentTime % (CYCLE_DURATION * Math.max(1, logos.length))) /
      CYCLE_DURATION
  );
  const stride = Math.max(1, Math.ceil(logos.length / 4)); // spread choices across list
  const idx = logos.length ? (base + slot * stride) % logos.length : 0;
  const logo = logos.length ? logos[idx] : null;

  if (!logo) {
    return <div className="h-24 w-36 rounded-xl bg-gray-100" />;
  }

  return (
    <motion.div
      className="relative h-24 w-36 overflow-hidden "
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${logo.id}-${base}`}
          className="absolute inset-0 flex items-center justify-center p-3"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 280, damping: 22 },
          }}
          exit={{ scale: 0.98, opacity: 0, transition: { duration: 0.2 } }}
        >
          <Image
            src={logo.src}
            alt={logo.name}
            width={180}
            height={72}
            className="max-h-full max-w-full object-contain"
            priority={slot < 2}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ================================ WRAPPER ================================ */

interface LogoCarouselProps {
  columns?: number;
  logos: Logo[];
}

export function LogoCarousel({ columns = 4, logos }: LogoCarouselProps) {
  const [logoColumns, setLogoColumns] = useState<Logo[][]>([]);
  const [time, setTime] = useState(0);

  // desktop/tablet distribution (original)
  const distributeLogos = useCallback(
    (list: Logo[]) => {
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      const result: Logo[][] = Array.from({ length: columns }, () => []);
      shuffled.forEach((logo, index) => {
        result[index % columns].push(logo);
      });
      const maxLength = Math.max(0, ...result.map((col) => col.length));
      result.forEach((col) => {
        while (col.length < maxLength) {
          col.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
        }
      });
      return result;
    },
    [columns]
  );

  useEffect(() => {
    setLogoColumns(distributeLogos(logos));
  }, [logos, distributeLogos]);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 100), 100);
    return () => clearInterval(id);
  }, []);

  if (!logos?.length) return null;

  return (
    <div className="w-full">
      {/* Mobile: big 2×2 grid */}
      <div className="sm:hidden grid grid-cols-2 gap-4 justify-items-center py-6">
        <LogoTile logos={logos} slot={0} currentTime={time} />
        <LogoTile logos={logos} slot={1} currentTime={time} />
      </div>

      {/* Tablet/Desktop: original animated columns */}
      <div className="hidden sm:block">
        <div className="w-full flex justify-center py-8">
          {logoColumns.map((columnLogos, index) => (
            <LogoColumn
              key={index}
              logos={columnLogos}
              columnIndex={index}
              currentTime={time}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
