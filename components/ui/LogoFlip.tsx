import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@betterinternship/components";

/**
 * Represents a company with display information
 */
interface Company {
  /** The name of the company */
  name: string;
  /** URL or path to the company logo image */
  image: string;
}

/**
 * Represents a pair of companies for front and back of a flip card
 */
interface CompanyPair {
  /** Company displayed on the front of the card */
  front: Company;
  /** Company displayed on the back of the card */
  back: Company;
}

/**
 * Props for the CompanyScroller component
 */
interface CompanyCardProps {
  /** Array of company data to display in flip cards */
  data: Company[];
}

/**
 * Renders a single card side (front or back) with company data
 *
 * @param company - Company data to display
 * @param key - Unique key for React (front/back)
 * @returns JSX element for the card side
 */
const RenderCardSide = ({
  company,
  key,
}: {
  company: Company;
  key: string;
}) => {
  const { isMobile } = useAppContext();
  const router = useRouter();

  /**
   * Handles click on company card to navigate to search results
   *
   * @param companyName - Name of the company to search for
   */
  const handleSearchClick = (companyName: string) => {
    router.push(`/search?q=${encodeURIComponent(companyName)}`);
  };

  return (
    <div
      key={key}
      className={cn(
        isMobile ? "h-16 w-28" : "h-20 w-36",
        "overflow-hidden rounded-[0.33em] border bg-white dark:border-zinc-700 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex items-center justify-center p-3",
      )}
      onClick={() => handleSearchClick(company.name)}
    >
      <img
        src={company.image}
        alt={company.name}
        className="h-full w-full object-contain"
        onError={(e) => {
          console.error(`Failed to load image: ${company.image}`);
          e.currentTarget.style.display = "none";
        }}
        onLoad={() => console.log(`Successfully loaded: ${company.image}`)}
      />
    </div>
  );
};

/**
 * Individual flip card component that displays two companies alternately
 * Features automatic flipping with random timing and responsive sizing
 *
 * @param companyPair - The front and back company data for this card
 * @param index - The index of this card in the grid (available for future animations)
 */
function CompanyCard({
  companyPair: { front, back },
  index,
}: {
  companyPair: CompanyPair;
  index: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Random initial delay for each card to prevent synchronized flipping
    const initialDelay = Math.random() * 3000;

    // Set up interval for automatic flipping with random timing (5-9 seconds)
    const flipInterval = setInterval(
      () => {
        setIsFlipped((prev) => !prev);
      },
      5000 + Math.random() * 4000,
    ); // Flip every 3-5 seconds randomly

    const timeoutId = setTimeout(() => {
      // Start the interval after initial delay
    }, initialDelay);

    return () => {
      clearInterval(flipInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
      <RenderCardSide key="" company={front} />
      <RenderCardSide key="" company={back} />
    </ReactCardFlip>
  );
}

/**
 * Main component that displays a responsive grid of flipping company logo cards
 * Takes an array of company data and creates flip cards showing 2 companies per card
 * Automatically pairs companies and creates cards based on available data
 *
 * Features:
 * - Responsive sizing (smaller on mobile)
 * - Automatic pairing of companies into flip cards
 * - Click-to-search functionality
 * - Random flip timing to create dynamic visual effect
 *
 * @param data - Array of company objects with name and image properties
 * @returns A responsive grid of flipping company logo cards
 */
export default function CompanyScroller({ data }: CompanyCardProps) {
  // Create pairs of companies for flip cards
  const jobPairs: CompanyPair[] = [];

  // Pair companies together for front/back of cards
  for (let i = 0; i < data.length; i += 2) {
    if (i + 1 < data.length) {
      jobPairs.push({
        front: data[i],
        back: data[i + 1],
      });
    }
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full flex gap-1 justify-center">
        {jobPairs.map((jobPair, index) => (
          <CompanyCard
            key={`${jobPair.front.name}-${jobPair.back.name}`}
            companyPair={jobPair}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
