import { ArrowRight, MessageSquare } from "lucide-react";
import { buildRedditCompanySearchUrl } from "@/lib/reddit-discussion";
import { Divider } from "@/components/ui/divider";

export function FindCompanyReviews({
  companyName,
}: {
  companyName?: string | null;
}) {
  const searchUrl = buildRedditCompanySearchUrl(companyName);
  if (!searchUrl) return null;

  return (
    <section>
      <Divider />
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group -mt-5 -mb-5 flex w-full items-center gap-3 rounded-[0.33em] px-3 py-5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-4"
      >
        <MessageSquare
          className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-gray-900">
            Student reviews
          </span>
          <span className="mt-0.5 block text-sm leading-relaxed text-gray-600">
            See what other interns have said about this company.
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary">
          Read reviews
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      </a>
    </section>
  );
}
