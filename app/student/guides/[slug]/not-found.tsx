import Link from "next/link";
import { landingContainerClassName } from "@/components/landing/layout";
import { cn } from "@betterinternship/components";

/** Friendly unavailable-article screen. HTTP handling is owned by the route's
 * notFound()/dynamicParams behavior, not by this presentation component. */
export default function GuideNotFound() {
  return (
    <main
      id="guides-main"
      className={cn(
        landingContainerClassName,
        "py-16 [&_h1]:text-[30px] [&_h1]:font-bold [&_p]:mb-6 [&_p]:mt-4 [&_p]:text-[#53637b]",
      )}
    >
      <h1>That guide isn’t available.</h1>
      <p>It may have moved or hasn’t been published yet.</p>
      <Link
        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-[#005dcc] px-4.5 py-3 text-sm font-semibold text-white no-underline hover:bg-[#004fab] motion-safe:transition-colors motion-safe:duration-[160ms] motion-safe:active:translate-y-px"
        href="/guides"
      >
        Explore Guides
      </Link>
    </main>
  );
}
