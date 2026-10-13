import type { Metadata } from "next";
import Image from "next/image";
import { GuideCard } from "@/components/guides/guide-card";
import { getGuides, guidesPreview } from "@/lib/guides/guide-content-loader";
import { baseUrl } from "@/lib/site-url";
import { HomepageCommunity } from "@/components/landingStudent/sections/homepage-community";
import { landingContainerClassName } from "@/components/landing/layout";

const title =
  "Internship & OJT Guides for Philippine Students | BetterInternship";
const description =
  "Clear, practical advice for Philippine students writing their first internship resume, choosing suitable opportunities, and preparing for interviews.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${baseUrl}/guides` },
  robots: guidesPreview ? { index: false, follow: false } : undefined,
  openGraph: {
    title,
    description,
    url: `${baseUrl}/guides`,
    type: "website",
    images: [{ url: `${baseUrl}/og.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${baseUrl}/og.png`],
  },
};

/** Public /guides library (host rewrites hide /student). The loader includes drafts
 * only in preview; a production library with no published articles stays empty. */
export default async function GuidesPage() {
  const guides = await getGuides();
  return (
    <main id="guides-main" tabIndex={-1} className={landingContainerClassName}>
      <header className="relative pb-16 pt-22 text-center max-md:pb-9 max-md:pt-22.5 [&_h1]:m-0 [&_h1]:text-[clamp(38px,5.5vw,78px)] [&_h1]:font-[750] [&_h1]:leading-[1.04] [&_h1]:tracking-[-.05em] max-md:[&_h1]:text-[clamp(36px,8vw,52px)] [&>p:last-child]:mx-auto [&>p:last-child]:mb-0 [&>p:last-child]:mt-5.5 [&>p:last-child]:max-w-[55ch] [&>p:last-child]:text-lg [&>p:last-child]:leading-[1.65] [&>p:last-child]:text-[#4a5870] max-md:[&>p:last-child]:text-base">
        <Image
          className="pointer-events-none absolute -left-3.75 top-18.75 h-auto w-45 -rotate-12 opacity-[.72] [filter:saturate(.55)_brightness(1.07)_contrast(.94)] max-lg:-left-5 max-lg:top-6.25 max-lg:w-30 max-md:left-1.5 max-md:top-0 max-md:w-22.5"
          src="/homepage/hero-cap.webp"
          width={640}
          height={428}
          sizes="(max-width: 767px) 90px, 180px"
          alt=""
        />
        <Image
          className="pointer-events-none absolute right-3.75 top-25 h-auto w-30 rotate-10 opacity-[.68] [filter:saturate(.52)_brightness(1.09)_contrast(.93)] max-lg:-right-2.5 max-lg:top-7.5 max-lg:w-22.5 max-md:right-4 max-md:top-.5 max-md:w-17.5"
          src="/homepage/landing-bulb.webp"
          width={480}
          height={513}
          sizes="(max-width: 767px) 70px, 120px"
          alt=""
        />
        <h1>
          Your first internship.
          <br />A little more guidance.
        </h1>
        <p>
          Write your resume, find work you'd like to try, and feel more prepared
          for your interview.
        </p>
      </header>
      {guides.length ? (
        <section
          aria-label="Start here"
          className="grid grid-cols-3 gap-x-5 gap-y-0 max-lg:gap-x-3.5 max-md:grid-cols-1 max-md:gap-7"
        >
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </section>
      ) : (
        <section className="py-16 [&_h2]:text-[30px] [&_h2]:font-bold [&_p]:mb-6 [&_p]:mt-4 [&_p]:text-[#53637b]">
          <h2>Our first guides are on their way.</h2>
          <p>
            In the meantime, explore internships and start building your
            shortlist.
          </p>
        </section>
      )}
      <div className="mb-18 max-md:mb-12">
        <HomepageCommunity />
      </div>
    </main>
  );
}
