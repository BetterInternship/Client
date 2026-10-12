import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/lib/guides/guide-content-loader";
import { Card } from "@/components/ui/temp/card";

/** Server-rendered library link. Nested subgrids share title/summary/footer
 * rows across desktop cards; mobile cards use their natural content height. */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card
      as="article"
      variant="listing"
      className="overflow-hidden rounded-2xl shadow-landing-card md:row-span-3 md:grid md:grid-rows-subgrid"
    >
      <Link
        href={`/guides/${guide.slug}`}
        className="group block h-full text-inherit no-underline md:row-span-3 md:grid md:grid-rows-subgrid"
      >
        <div className="p-6 max-lg:p-5 md:row-span-3 md:grid md:grid-rows-subgrid">
          <h2 className="m-0 max-w-[29ch] text-balance text-2xl font-bold leading-[1.18] tracking-[-.035em] group-hover:text-landing-blue-hover max-lg:text-[21px] max-md:text-[25px]">
            {guide.title}
          </h2>
          <p className="mb-6 mt-4 text-[15px] leading-[1.7] text-[#4a5870]">
            {guide.takeaway}
          </p>
          <div className="flex items-center justify-between gap-4 text-[13px] text-[#53637b]">
            <span>
              {guide.category} · {guide.readingMinutes} min read
            </span>
            <span className="inline-flex items-center gap-2 font-semibold text-landing-blue-hover">
              Read guide{" "}
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="motion-safe:transition-transform motion-safe:duration-[160ms] motion-safe:group-hover:translate-x-[3px]"
              />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
