import Image from "next/image";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/temp/card";
import { LinkButton } from "@/components/ui/temp/button";

/** Static download, not a PDF generator/viewer bundle. Native download works
 * without JavaScript; preview is a small rendered image of the actual PDF. */
export function ResumeDownload() {
  return (
    <Card className="not-prose my-6 grid grid-cols-[140px_1fr] items-center gap-6 bg-landing-tint p-6 max-sm:grid-cols-1 max-sm:gap-4 max-sm:p-5">
      <a
        href="/guide-resources/internship-resume-example.pdf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open resume PDF preview in a new tab"
        className="block max-sm:mx-auto max-sm:w-36"
      >
        <Image
          src="/guide-resources/internship-resume-example.png?v=serif-2"
          width={420}
          height={594}
          sizes="140px"
          alt="Example student resume showing education, school projects, organization work, and skills"
          className="h-auto w-full rounded-sm border border-landing-control bg-white"
        />
      </a>
      <div>
        <h3 className="m-0 text-xl font-semibold text-landing-navy">
          Example resume
        </h3>
        <p className="mb-4 mt-2 text-sm leading-relaxed text-landing-nav">
          Not sure how to put it all together? Use this example to plan your
          layout, then fill your own resume with projects and experiences you
          can talk about.
        </p>
        <LinkButton
          href="/guide-resources/internship-resume-example.pdf"
          download="BetterInternship-Example-Resume.pdf"
          className="gap-2 whitespace-normal text-center"
        >
          <Download size={16} aria-hidden="true" />
          Download PDF
        </LinkButton>
      </div>
    </Card>
  );
}
