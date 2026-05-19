"use client";

import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import anterioreLogo from "../anteriore/logo.png";
import cebuPacificLogo from "../cebu-pacific/logo.png";
import miroLogo from "../miro/miro-icon.svg";
import paralumanLogo from "../paraluman/logo.png";
import sofiAiLogo from "../sofi-ai/logo.png";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-super-listings-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-super-listings-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-super-listings-body",
});

const PCC_LOGO_URL =
  "https://www.philippinechamber.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimg_pcci_logo.35f015b9.png&w=1200&q=75";

function LogoImage({
  src,
  alt,
  className,
}: {
  src: string | StaticImageData;
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={72}
      height={72}
      className={cn("h-12 w-12 object-contain", className)}
    />
  );
}

type Listing = {
  company: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  logo: ReactNode;
};

const listings: Listing[] = [
  {
    company: "Anteriore",
    title: "Product & Engineering Intern",
    description:
      "Build practical startup product flows inside a fast-moving engineering team.",
    tags: ["Product", "Engineering", "Startup"],
    href: "/super-listing/anteriore",
    logo: <LogoImage src={anterioreLogo} alt="Anteriore logo" />,
  },
  {
    company: "Cebu Pacific",
    title: "Digital Travel Experience Challenge",
    description:
      "Redesign smoother digital journeys for millions of Filipino travelers.",
    tags: ["UX", "Travel", "Product"],
    href: "/super-listing/cebu-pacific",
    logo: <LogoImage src={cebuPacificLogo} alt="Cebu Pacific logo" />,
  },
  {
    company: "Founders For Founders",
    title: "Startup Accelerator Intern",
    description:
      "Help scout, support, and grow a founder community built for AI-native builders.",
    tags: ["Startups", "Ops", "Community"],
    href: "/super-listing/fff",
    logo: (
      <span className="[font-family:var(--font-super-listings-heading)] text-xl font-black tracking-[-0.08em] text-[#0D6BFF]">
        FFF
      </span>
    ),
  },
  {
    company: "Miro",
    title: "Miro-thon Internship Challenge",
    description:
      "Build something impressive in a time-boxed creative challenge for Miro.",
    tags: ["Product", "Creative", "Collaboration"],
    href: "/super-listing/miro",
    logo: <LogoImage src={miroLogo} alt="Miro logo" />,
  },
  {
    company: "Paraluman News",
    title: "Multilingual News Delivery Challenge",
    description:
      "Design a practical publishing solution for faster multilingual news delivery.",
    tags: ["Web", "News", "Language"],
    href: "/super-listing/paraluman",
    logo: <LogoImage src={paralumanLogo} alt="Paraluman News logo" />,
  },
  {
    company: "Philippine Chamber of Commerce",
    title: "Business Innovation Challenge",
    description:
      "Turn PCCI's member network into a usable operating system for business connections.",
    tags: ["Business", "Strategy", "Software"],
    href: "/super-listing/pcc",
    logo: (
      <img
        src={PCC_LOGO_URL}
        alt="Philippine Chamber of Commerce logo"
        className="h-12 w-12 object-contain"
      />
    ),
  },
  {
    company: "Sofi AI",
    title: "Frontend AI Product Challenge",
    description:
      "Design trustworthy AI product flows for real business automation workflows.",
    tags: ["Frontend", "UI/UX", "AI"],
    href: "/super-listing/sofi-ai",
    logo: <LogoImage src={sofiAiLogo} alt="Sofi AI logo" />,
  },
  {
    company: "Sofi AI",
    title: "Marketing Intern",
    description:
      "Create a marketing proposal that makes an AI product feel worth talking about.",
    tags: ["Marketing", "AI", "Content"],
    href: "/super-listing/sofi-ai-marketing",
    logo: <LogoImage src={sofiAiLogo} alt="Sofi AI logo" />,
  },
];

function ListingsHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#061b3d] bg-cover bg-center px-4 pb-28 pt-24 text-center sm:px-6 sm:pb-32 sm:pt-28 lg:px-8 lg:pb-36 lg:pt-32"
      style={{ backgroundImage: "url('/super-listings/bg2.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#061b3d]/58" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-[1] h-full w-[62rem] -translate-x-1/2 bg-[linear-gradient(168deg,rgba(255,246,205,0.18)_0%,rgba(255,236,156,0.46)_34%,rgba(255,247,208,0.24)_70%,transparent_100%)] opacity-95 [clip-path:polygon(43%_0,57%_0,100%_100%,0_100%)] blur-sm"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_33%,rgba(255,248,218,0.24),transparent_30%),radial-gradient(circle_at_50%_18%,rgba(13,107,255,0.22),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <h1
          className="[font-family:var(--font-super-listings-heading)] text-[clamp(2.7rem,6vw,4.75rem)] font-black leading-[0.98] tracking-[-0.06em]"
          style={{ textShadow: "0 4px 18px rgba(0, 0, 0, 0.35)" }}
        >
          <span className="text-[#FFF7E8]">Explore Super Listings</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance [font-family:var(--font-super-listings-body)] text-[rgba(255,247,232,0.84)] sm:text-xl">
          Browse challenge-based internships where students prove their skills
          through real work.
        </p>
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="group flex min-h-[430px] flex-col rounded-[0.33em] border-[#dfe7f2] bg-white/95 p-6 shadow-[0_24px_70px_-54px_rgba(8,26,58,0.55)] transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_30px_90px_-58px_rgba(8,26,58,0.78)]">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[0.33em] bg-blue-50 text-[#0D6BFF] ring-1 ring-blue-100">
        {listing.logo}
      </div>
      <p className="[font-family:var(--font-super-listings-heading)] text-base font-bold text-[#081A3A]">
        {listing.company}
      </p>
      <h2 className="mt-6 [font-family:var(--font-super-listings-heading)] text-xl font-bold leading-snug tracking-[-0.04em] text-[#081A3A]">
        {listing.title}
      </h2>
      <p className="mt-5 [font-family:var(--font-super-listings-body)] text-sm font-semibold leading-7 text-[#081A3A]/78">
        {listing.description}
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        {listing.tags.map((tag) => (
          <span
            key={`${listing.company}-${tag}`}
            className="rounded-[0.33em] bg-blue-50 px-2.5 py-1.5 [font-family:var(--font-super-listings-body)] text-[11px] font-bold text-[#0D6BFF]"
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={listing.href}
        className="mt-auto inline-flex h-14 items-center justify-center gap-2 rounded-[0.33em] border border-[#0D6BFF] px-5 [font-family:var(--font-super-listings-heading)] text-base font-bold text-[#0D6BFF] transition-colors hover:bg-[#0D6BFF] hover:text-white"
      >
        View challenge
        <ArrowRight className="h-5 w-5" />
      </Link>
    </Card>
  );
}

function ListingsGrid() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbff] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(13,107,255,0.12),transparent_28%),radial-gradient(circle_at_88%_30%,rgba(245,181,27,0.13),transparent_24%),radial-gradient(circle_at_34%_88%,rgba(13,107,255,0.09),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-[1120px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard
            key={`${listing.company}-${listing.title}`}
            listing={listing}
          />
        ))}
      </div>
    </section>
  );
}

export default function SuperListingsBrowsePage() {
  return (
    <main
      className={cn(
        "min-h-screen overflow-x-hidden bg-white [font-family:var(--font-super-listings-body)]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <ListingsHero />

      <ListingsGrid />
    </main>
  );
}
