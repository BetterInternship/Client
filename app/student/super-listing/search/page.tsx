"use client";

import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { ArrowRight, Search } from "lucide-react";

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
      className={cn("h-10 w-10 object-contain sm:h-12 sm:w-12", className)}
    />
  );
}

type Listing = {
  company: string;
  title: string;
  role: string;
  description: string;
  href: string;
  logo: ReactNode;
};

const listings: Listing[] = [
  {
    company: "Anteriore",
    title: "Build what the future needs",
    role: "Product & Engineering Intern",
    description:
      "Build practical startup product flows inside a fast-moving engineering team.",
    href: "/super-listing/anteriore",
    logo: (
      <LogoImage
        src={anterioreLogo}
        alt="Anteriore logo"
        className="brightness-0"
      />
    ),
  },
  {
    company: "Cebu Pacific",
    title: "Redesign journeys for millions",
    role: "Digital Travel Experience Challenge",
    description:
      "Redesign smoother digital journeys for millions of Filipino travelers.",
    href: "/super-listing/cebu-pacific",
    logo: <LogoImage src={cebuPacificLogo} alt="Cebu Pacific logo" />,
  },
  {
    company: "Founders For Founders",
    title: "Help the next great founder rise",
    role: "Startup Accelerator Intern",
    description:
      "Help scout, support, and grow a founder community built for AI-native builders.",
    href: "/super-listing/fff",
    logo: (
      <span className="[font-family:var(--font-super-listings-heading)] text-xl font-black tracking-[-0.08em] text-[#0D6BFF]">
        FFF
      </span>
    ),
  },
  {
    company: "Miro",
    title: "Turn messy ideas into momentum",
    role: "Miro-thon Internship Challenge",
    description:
      "Build something impressive in a time-boxed creative challenge for Miro.",
    href: "/super-listing/miro",
    logo: <LogoImage src={miroLogo} alt="Miro logo" />,
  },
  {
    company: "Paraluman News",
    title: "Bring stories across languages",
    role: "Multilingual News Delivery Challenge",
    description:
      "Design a practical publishing solution for faster multilingual news delivery.",
    href: "/super-listing/paraluman",
    logo: <LogoImage src={paralumanLogo} alt="Paraluman News logo" />,
  },
  {
    company: "Philippine Chamber of Commerce",
    title: "Shape ideas that move business",
    role: "Business Innovation Challenge",
    description:
      "Turn PCCI's member network into a usable operating system for business connections.",
    href: "/super-listing/pcc",
    logo: (
      <img
        src={PCC_LOGO_URL}
        alt="Philippine Chamber of Commerce logo"
        className="h-12 w-12 object-contain brightness-0"
      />
    ),
  },
  {
    company: "Sofi AI",
    title: "Design AI people actually trust",
    role: "Frontend AI Product Challenge",
    description:
      "Design trustworthy AI product flows for real business automation workflows.",
    href: "/super-listing/sofi-ai",
    logo: (
      <LogoImage src={sofiAiLogo} alt="Sofi AI logo" className="brightness-0" />
    ),
  },
  {
    company: "Sofi AI",
    title: "Make AI feel worth talking about",
    role: "Marketing Intern",
    description:
      "Create a marketing proposal that makes an AI product feel worth talking about.",
    href: "/super-listing/sofi-ai-marketing",
    logo: (
      <LogoImage src={sofiAiLogo} alt="Sofi AI logo" className="brightness-0" />
    ),
  },
];

function ListingsHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#001138] bg-cover bg-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28"
      style={{ backgroundImage: "url('/super-listings/bg2.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#001138]/58" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-[1] h-[58%] w-[76rem] -translate-x-1/2 bg-[linear-gradient(168deg,rgba(255,246,205,0.2)_0%,rgba(255,236,156,0.48)_38%,rgba(255,247,208,0.2)_72%,transparent_100%)] opacity-90 blur-sm [clip-path:polygon(42%_0,58%_0,82%_100%,18%_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_58%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[55%] z-[1] h-[15rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,242,194,0.24)_0%,rgba(255,230,150,0.13)_42%,transparent_72%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_42%,rgba(255,248,218,0.2),transparent_28%),radial-gradient(circle_at_50%_18%,rgba(13,107,255,0.22),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <h1
          className="[font-family:var(--font-super-listings-heading)] text-[clamp(2.25rem,6vw,4.75rem)] font-black leading-[0.98] tracking-[-0.06em]"
          style={{ textShadow: "0 4px 18px rgba(0, 0, 0, 0.35)" }}
        >
          <span className="text-[#FFF7E8]">Explore Super Listings</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance [font-family:var(--font-super-listings-body)] text-sm leading-6 text-[rgba(255,247,232,0.84)] sm:mt-6 sm:text-xl sm:leading-8">
          Browse challenge-based internships where students prove their skills
          through real work.
        </p>
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="group flex min-h-[330px] flex-col rounded-[0.33em] border-[#dfe7f2] bg-white/95 p-4 shadow-[0_20px_58px_-50px_rgba(8,26,58,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_28px_80px_-58px_rgba(8,26,58,0.78)] sm:min-h-[370px] sm:p-5">
      <div className="mb-5 flex h-11 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#0D6BFF]">
          {listing.logo}
        </div>
        <div className="min-w-0">
          <p className="[font-family:var(--font-super-listings-heading)] text-sm font-bold leading-tight text-[#081A3A]">
            {listing.company}
          </p>
        </div>
      </div>
      <div className="min-h-[6.8rem]">
        <h2 className="[font-family:var(--font-super-listings-heading)] text-[1.45rem] font-black leading-[1.05] tracking-[-0.055em] text-[#081A3A]">
          {listing.title}
        </h2>
        <p className="mt-3 [font-family:var(--font-super-listings-heading)] text-sm font-bold leading-snug text-[#0D6BFF]">
          {listing.role}
        </p>
      </div>
      <p className="mt-3 min-h-[4.5rem] [font-family:var(--font-super-listings-body)] text-sm font-semibold leading-6 text-[#081A3A]/78">
        {listing.description}
      </p>

      <Link
        href={listing.href}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border border-[#0D6BFF] px-4 [font-family:var(--font-super-listings-heading)] text-sm font-bold text-[#0D6BFF] transition-colors hover:bg-[#0D6BFF] hover:text-white"
      >
        View challenge
        <ArrowRight className="h-5 w-5" />
      </Link>
    </Card>
  );
}

function ListingsGrid() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#001138_0rem,#001138_8rem,#10284b_16rem,#eef7ff_30rem,#f7fbff_40rem,#ffffff_100%)] px-3 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0rem,transparent_16rem,#000_28rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20rem,rgba(13,107,255,0.1),transparent_18rem),radial-gradient(circle_at_30%_86%,rgba(13,107,255,0.08),transparent_28%)]" />

      <div className="relative mx-auto mb-5 max-w-[1120px]">
        <div className="flex items-center gap-3 rounded-[0.33em] border border-[#dbe6f5] bg-white p-2 ">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[0.33em] px-3 transition-colors focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-[#0D6BFF]" />
            <input
              type="text"
              placeholder="Search challenges, companies, or roles"
              className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 [font-family:var(--font-super-listings-body)] text-sm font-semibold text-[#081A3A] shadow-none outline-none ring-0 placeholder:text-[#28466f]/55 focus:border-0 focus:outline-none focus:ring-0"
            />
          </label>
        </div>
      </div>
      <div className="relative mx-auto grid max-w-[1120px] gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {[...listings].reverse().map((listing) => (
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
