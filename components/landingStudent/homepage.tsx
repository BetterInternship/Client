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
import { getHomepageFields } from "./homepage-data";
import styles from "./homepage.module.css";
import { DiscordMark } from "@/components/features/student/top/DiscordMark";
import { HomepageMotion } from "./homepage-motion";
import { HomepageTestimonials } from "./homepage-testimonials";
import { HomepageFaq } from "./homepage-faq";
import { HomepageOpportunityBrowser } from "./homepage-opportunity-browser";
import {
  TopPageBackdrop,
  TopDiscordArtwork,
} from "@/components/features/student/top/TopArtwork";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";

const hireHref =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  "https://hire.betterinternship.com";
const loginHref = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

const heroSprites = [
  {
    name: "badge",
    width: 640,
    height: 564,
    sizes: "(max-width: 767px) 110px, (max-width: 1379px) 280px, 420px",
  },
  {
    name: "profile",
    width: 640,
    height: 434,
    sizes: "(max-width: 767px) 80px, (max-width: 1379px) 176px, 256px",
  },
  {
    name: "cap",
    width: 640,
    height: 428,
    sizes: "(max-width: 767px) 80px, (max-width: 1379px) 100px, 170px",
  },
  { name: "squiggle", width: 640, height: 264, sizes: "56px" },
  {
    name: "plane",
    width: 640,
    height: 409,
    sizes: "(max-width: 767px) 36px, (max-width: 1379px) 48px, 72px",
  },
  { name: "sparkle", width: 640, height: 667, sizes: "20px" },
];

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
      <Image src="/homepage-logo.png" width={36} height={36} alt="" />
      <span>BetterInternship</span>
    </Link>
  );
}

export function StudentHomepage({ refs }: { refs: RefsData }) {
  const fields = getHomepageFields(refs.job_categories);
  return (
    <HomepageMotion className={styles.homepage} style={topAccentStyle()}>
      <div className="home-page-backdrop" aria-hidden="true">
        <TopPageBackdrop />
      </div>
      <div className="home-landing-art" aria-hidden="true">
        {heroSprites.map(({ name, width, height, sizes }) => (
          <Image
            key={name}
            src={`/homepage/hero-${name}.webp`}
            width={width}
            height={height}
            sizes={sizes}
            alt=""
            className={`home-hero-sprite home-hero-sprite-${name}`}
          />
        ))}
      </div>
      <header className="home-header home-container">
        <Brand />
        <nav aria-label="Main navigation">
          <a href={hireHref}>For Companies</a>
          <a href={STUDENT_FORM_GUIDE}>Guides</a>
          <a href={loginHref} className="home-login">
            Log in
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </header>
      <main className="home-main">
        <section
          className="home-intro home-container"
          aria-labelledby="home-heading"
        >
          <h1 id="home-heading">
            <span className="home-headline-line">Better internships</span>{" "}
            <span className="home-headline-line">start here</span>
          </h1>
          <p>Discover opportunities across the Philippines.</p>
          <HomepageOpportunityBrowser fields={fields} />
        </section>
        <div className="home-container">
          <HomepageTestimonials testimonials={testimonials} />

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
            <div className="home-section-art" aria-hidden="true">
              <Image
                src="/homepage/landing-bulb.webp"
                width={480}
                height={513}
                sizes="(max-width: 1023px) 80px, 120px"
                className="home-page-sprite home-page-sprite-bulb"
                alt=""
              />
            </div>
            <div className="home-section-heading">
              <h2 id="home-faq-heading">Frequently asked questions</h2>
            </div>
            <HomepageFaq />
          </section>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-container home-footer-top">
          <div className="home-footer-brand">
            <Brand />
            <nav
              className="home-footer-icons"
              aria-label="Social and contact links"
            >
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
          </div>
          <nav className="home-footer-group" aria-label="For students">
            <h3>For Students</h3>
            <Link href="/search">Find Internships</Link>
            <a href={STUDENT_FORM_GUIDE}>Guides</a>
          </nav>
          <div className="home-footer-company">
            <nav className="home-footer-group" aria-label="For companies">
              <h3>For Companies</h3>
              <a href={hireHref}>Post Opportunities</a>
              <a href={SUPPORT_EMAIL_LINK}>Contact Us</a>
            </nav>
          </div>
        </div>
        <div className="home-container home-footer-bottom">
          <nav className="home-footer-links" aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
          <p>© {new Date().getFullYear()} BetterInternship.</p>
        </div>
      </footer>
    </HomepageMotion>
  );
}
