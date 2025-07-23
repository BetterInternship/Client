"use client";

import { useCallback, useEffect, useState } from "react";
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
          <div className="bg-white rounded-[0.33rem] flex items-center justify-center w-[90%] h-[90%]">
            <Image
              src={currentLogo.src}
              alt={currentLogo.name}
              width={120}
              height={40}
              className="h-auto w-auto max-h-[80%] max-w-[80%] object-contain"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function useMobileColumns() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? 2 : 4;
}

interface LogoCarouselProps {
  columns?: number;
  logos: Logo[];
}

export function LogoCarousel({ columns, logos }: LogoCarouselProps) {
  const dynamicColumns = useMobileColumns();
  const actualColumns = columns ?? dynamicColumns;
  const [logoColumns, setLogoColumns] = useState<Logo[][]>([]);
  const [time, setTime] = useState(0);

  // Mobile: show 2x2 grid of first 4 logos
  const isMobile = actualColumns === 2;

  const distributeLogos = useCallback(
    (logos: Logo[]) => {
      const shuffled = [...logos].sort(() => Math.random() - 0.5);
      const result: Logo[][] = Array.from({ length: actualColumns }, () => []);

      shuffled.forEach((logo, index) => {
        result[index % actualColumns].push(logo);
      });

      const maxLength = Math.max(...result.map((col) => col.length));
      result.forEach((col) => {
        while (col.length < maxLength) {
          col.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
        }
      });

      return result;
    },
    [actualColumns]
  );

  useEffect(() => {
    if (!isMobile) {
      setLogoColumns(distributeLogos(logos));
    }
  }, [logos, distributeLogos, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      const interval = setInterval(() => {
        setTime((prev) => prev + 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  if (isMobile) {
    // 2 columns, 2 rows
    const mobileLogos = logos.slice(0, 4);
    const col1 = [mobileLogos[0], mobileLogos[2]].filter(Boolean);
    const col2 = [mobileLogos[1], mobileLogos[3]].filter(Boolean);

    return (
      <div className="bg-black w-full flex flex-row items-center justify-center px-4 py-4 gap-4">
        {[col1, col2].map((col, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            {col.map((logo) => (
              <div key={logo.id} className="bg-white rounded-[0.33rem] flex items-center justify-center w-24 h-14">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className="h-auto w-auto max-h-[80%] max-w-[80%] object-contain"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: carousel as before
  return (
    <div className="bg-black w-full">
      <div className={`w-full bg-black flex flex-col ${actualColumns > 2 ? "md:flex-row" : "flex-row"} flex-wrap items-center justify-center px-4 md:px-12`}>
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
  );
}