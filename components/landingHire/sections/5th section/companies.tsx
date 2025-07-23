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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const logosPerColumn = isMobile ? 2 : 1;

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: logosPerColumn }).map((_, i) => {
        let currentIndex;
        if (isMobile) {
          // 2 columns, 2 rows for mobile
          const totalCells = 2 * 2;
          const baseIndex = columnIndex + i * 2;
          const offset = Math.floor(currentTime / CYCLE_DURATION) % Math.ceil(logos.length / totalCells);
          currentIndex = (baseIndex + offset * totalCells) % logos.length;
        } else {
          // Desktop dont touch
          const adjustedTime = (currentTime + columnIndex * 200) % (CYCLE_DURATION * logos.length);
          currentIndex = Math.floor(adjustedTime / CYCLE_DURATION);
        }
        const currentLogo = logos[currentIndex];

        return (
          <motion.div
            key={`${currentLogo.id}-${currentIndex}-${i}`}
            className="relative h-14 w-24 overflow-hidden md:h-24 md:w-48"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: columnIndex * 0.1 + i * 0.2,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentLogo.id}-${currentIndex}-${i}`}
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
      })}
    </div>
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
    setLogoColumns(distributeLogos(logos));
  }, [logos, distributeLogos, actualColumns]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black w-full">
      <div className={`w-full bg-black flex flex-row flex-wrap items-center justify-center px-4 md:px-12`}>
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