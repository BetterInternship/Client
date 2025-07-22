"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
  link: string;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative h-80 w-[20rem] max-w-xs p-4 md:h-[28rem] md:w-[28rem] md:max-w-xl md:p-6">
      {cards.map((card, index) => {
        return (
          <Link href={card.link} key={card.id} passHref>
            <motion.div
              className="absolute bg-white h-[22rem] w-full max-w-xs p-4 rounded-2xl shadow-xl border border-neutral-200 shadow-black/[0.1] flex flex-col justify-between cursor-pointer 
    sm:h-80 md:h-[28rem] md:max-w-xl md:p-6"
              style={{ transformOrigin: "top center" }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: cards.length - index,
              }}
            >
              {/* Top badges and time */}
              <div className="flex flex-wrap items-center justify-between mb-3 gap-y-2">
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-block bg-neutral-200 text-black text-xs font-semibold px-3 py-1 rounded-full">
                    New Listing
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    has DLSU MOA
                  </span>
                </div>
                <span className="text-black text-xs font-medium ml-auto">
                  2 days ago
                </span>
              </div>
              {/* Main content */}
              <div className="flex flex-col gap-1 mb-4">
                <p className="text-black text-xl md:text-2xl font-bold">
                  {card.name}
                </p>
                <p className="text-black text-sm md:text-base font-normal">
                  {card.designation}
                </p>
              </div>
              {/* Details list */}
              <div className="flex flex-col text-black gap-2 mb-6">{card.content}</div>
              {/* Button */}
              <div className="mt-auto">
                <button className="w-full bg-white border border-neutral-300 rounded-lg py-3 text-black font-semibold text-base hover:bg-neutral-100 transition">
                  Apply Now
                </button>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};
