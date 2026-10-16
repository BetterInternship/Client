import { Button } from "@betterinternship/components";
import { Search } from "lucide-react";
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
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
          Company reviews
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <p>
              Curious about this company? See what students are saying on
              r/InternshipsPH.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            scheme="default"
            size="sm"
            className="shrink-0 rounded-[0.33em]"
          >
            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
              <Search className="h-4 w-4" aria-hidden="true" />
              Find reviews
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
