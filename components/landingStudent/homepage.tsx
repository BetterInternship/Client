import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Facebook, Mail } from "lucide-react";
import {
  BI_DISCORD_INVITE,
  STUDENT_FORM_GUIDE,
  SUPPORT_EMAIL_LINK,
  SUPPORT_FACEBOOK,
} from "@/constants";
import type { RefsData } from "@/lib/db/db.types";
import {
  getHomepageFields,
  getPopularSearches,
  quickFilters,
} from "./homepage-data";
import {
  LatestOpportunities,
  OpportunitiesSkeleton,
} from "./latest-opportunities";
import styles from "./homepage.module.css";
import { DiscordMark } from "@/components/features/student/top/DiscordMark";
import { HomepageMotion } from "./homepage-motion";
import { HomepageTestimonials } from "./homepage-testimonials";
import { HomepageFaq } from "./homepage-faq";
import { HomepageFieldPicker } from "./homepage-field-picker";
import { HomepageFieldCards } from "./homepage-field-cards";
import {
  TopPageBackdrop,
  TopDiscordArtwork,
} from "@/components/features/student/top/TopArtwork";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";

const hireHref =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  "https://hire.betterinternship.com";
const loginHref = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

// Supplied example copy. Replace with approved student testimonials.
const testimonials = [
  {
    quote:
      "I found my internship in just a few days. The one-click apply made the whole process so much easier.",
    name: "Andrea T.",
    program: "Communication Arts",
    role: "Marketing Intern",
    setup: "On-site",
    initials: "AT",
  },
  {
    quote:
      "I was able to find a company with an MOA for our university. Super useful for students!",
    name: "Miguel R.",
    program: "Computer Science",
    role: "Software Engineering Intern",
    setup: "Hybrid",
    initials: "MR",
  },
  {
    quote:
      "The listings are updated and relevant. I got interviews from two companies within a week!",
    name: "Janelle S.",
    program: "Information Systems",
    role: "Data Analyst Intern",
    setup: "Remote",
    initials: "JS",
  },
];

function Brand() {
  return (
    <Link href="/" className="home-brand" aria-label="BetterInternship home">
      <Image src="/BetterInternshipLogo.png" width={36} height={36} alt="" />
      <span>BetterInternship</span>
    </Link>
  );
}

export function StudentHomepage({ refs }: { refs: RefsData }) {
  const fields = getHomepageFields(refs.job_categories);
  const popular = getPopularSearches(fields);
  return (
    <HomepageMotion className={styles.homepage} style={topAccentStyle()}>
      <div className="home-page-backdrop" aria-hidden="true">
        <TopPageBackdrop />
      </div>
      <div className="home-hero">
        <Image
          src="/homepage-campus.webp"
          fill
          priority
          sizes="100vw"
          alt=""
          className="home-hero-image"
        />
        <div className="home-hero-scrim" aria-hidden="true" />
        <header className="home-header home-container">
          <Brand />
          <nav aria-label="Main navigation">
            <a href={hireHref}>For Companies</a>
            <a href={STUDENT_FORM_GUIDE}>Guides</a>
            <a href={loginHref} className="home-login">
              Log in
            </a>
          </nav>
        </header>
        <section
          className="home-hero-content home-container"
          aria-labelledby="home-heading"
        >
          <h1 id="home-heading">
            <span className="home-headline-line">Find internships.</span>{" "}
            <span className="home-headline-line">
              <span className="home-apply-word">Apply</span> in one click.
            </span>
          </h1>
          <p>Discover opportunities across the Philippines.</p>
          <div className="home-field-picker">
            <HomepageFieldPicker fields={fields} />
            <nav
              className="home-quick-filters"
              aria-label="Quick internship searches"
            >
              {quickFilters.map((filter) => (
                <Link href={filter.href} key={filter.label}>
                  {filter.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>

      <main className="home-container home-main">
        <section
          className="home-testimonials home-testimonials-marquee home-reveal"
          aria-labelledby="home-testimonials-heading"
        >
          <h2 className="sr-only" id="home-testimonials-heading">
            Student experiences
          </h2>
          <HomepageTestimonials testimonials={testimonials} />
        </section>

        <section
          className="home-section home-popular home-reveal"
          id="popular-searches"
          aria-labelledby="home-popular-heading"
        >
          <div className="home-section-heading">
            <h2 id="home-popular-heading">Popular searches</h2>
            <p>Explore what students are looking for.</p>
          </div>
          <HomepageFieldCards fields={popular.slice(0, 5)} />
        </section>

        <section
          className="home-section home-latest home-reveal"
          aria-labelledby="home-latest-heading"
        >
          <div className="home-section-heading home-heading-with-link">
            <div>
              <h2 id="home-latest-heading">Latest opportunities</h2>
              <p>Fresh internships from companies hiring now.</p>
            </div>
            <Link className="home-text-link" href="/search">
              View all internships <ArrowRight aria-hidden="true" size={20} />
            </Link>
          </div>
          <Suspense fallback={<OpportunitiesSkeleton />}>
            <LatestOpportunities refs={refs} loginHref={loginHref} />
          </Suspense>
        </section>

        <section
          className="home-discord home-discord-top home-section home-reveal"
          aria-labelledby="home-discord-heading"
        >
          <div className="home-discord-art" aria-hidden="true">
            <div className="home-discord-shared-art">
              <TopDiscordArtwork />
            </div>
          </div>
          <div className="home-discord-copy">
            <h2 id="home-discord-heading">
              Get notified when <span>new internships drop</span> and{" "}
              <span>apply with one click</span>
            </h2>
            <a className="home-discord-button" href={BI_DISCORD_INVITE}>
              <DiscordMark width={24} height={24} />
              Join the Discord
              <ArrowRight aria-hidden="true" size={20} />
            </a>
          </div>
        </section>

        <section
          className="home-section home-faq home-reveal"
          id="faq"
          aria-labelledby="home-faq-heading"
        >
          <div className="home-section-heading">
            <h2 id="home-faq-heading">Frequently asked questions</h2>
          </div>
          <HomepageFaq />
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container home-footer-grid">
          <div className="home-footer-brand">
            <Brand />
            <p>Discover opportunities. Build your future.</p>
          </div>
          <nav aria-label="For students">
            <h3>For Students</h3>
            <Link href="/search">Find Internships</Link>
            <a href="#popular-searches">Popular Searches</a>
            <a href={STUDENT_FORM_GUIDE}>Guides</a>
          </nav>
          <nav aria-label="For companies">
            <h3>For Companies</h3>
            <a href={hireHref}>Post Opportunities</a>
            <a href={SUPPORT_EMAIL_LINK}>Talent Solutions</a>
            <a href={SUPPORT_EMAIL_LINK}>Contact Us</a>
          </nav>
          <nav aria-label="Legal">
            <h3>Legal</h3>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Cookies &amp; privacy</Link>
          </nav>
          <div className="home-footer-socials">
            <nav aria-label="Social and contact links">
              <a href={BI_DISCORD_INVITE} aria-label="BetterInternship Discord">
                <MessageCircle size={20} aria-hidden="true" />
              </a>
              <a
                href={SUPPORT_FACEBOOK}
                aria-label="BetterInternship on Facebook"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a href={SUPPORT_EMAIL_LINK} aria-label="Email BetterInternship">
                <Mail size={20} aria-hidden="true" />
              </a>
            </nav>
            <p>
              © {new Date().getFullYear()} BetterInternship.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </HomepageMotion>
  );
}
