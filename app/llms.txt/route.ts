import { baseUrl } from "@/lib/site-url";
import { getPublishedGuideMetadata } from "@/lib/guides/guide-content-loader";
import { headers } from "next/headers";

export const revalidate = 3600;

const studentLlmsTxt = async () => {
  const guides = await getPublishedGuideMetadata();
  const guideLinks = guides
    .map(
      (guide) =>
        `- [${guide.title}](${baseUrl}/guides/${guide.slug}): ${guide.description}`,
    )
    .join("\n");

  return `# BetterInternship

> BetterInternship is an internship platform for students in the Philippines. Students search internship and OJT listings by field, check company MOAs with their university, and apply online.

## For students

- [Search internships](${baseUrl}/search): Browse open internship and OJT listings. Each listing page (${baseUrl}/search/<id>) has the role, company and application details.
${guides.length ? `- [Guides](${baseUrl}/guides): Practical advice for Philippine students on resumes, choosing an internship and interviews.\n` : ""}
${guides.length ? `## Guides\n\n${guideLinks}\n\n` : ""}## Other

- [Terms and conditions](${baseUrl}/terms)
- [Privacy policy](${baseUrl}/privacy)
- [Sitemap](${baseUrl}/sitemap.xml)
- Employers: [BetterInternship for recruiters](https://hire.betterinternship.com)
`;
};

const recruiterLlmsTxt = (origin: string) => `# BetterInternship for Recruiters

> BetterInternship is an internship platform in the Philippines. This site, hire.betterinternship.com, is the recruiter dashboard where employers post internship listings, review student applicants and manage hiring.

## For employers

- [Recruiter home](${origin}): What BetterInternship offers employers hiring interns in the Philippines.
- [Register as an employer](${origin}/register): Create a recruiter account.
- [Log in](${origin}/login): Access the recruiter dashboard. Dashboard pages require an account and are not public.
- [Help and support](${origin}/help): Contact options and the employer guide.

## Other

- Students looking for internships: [BetterInternship](${baseUrl})
`;

export async function GET() {
  const host = (await headers()).get("host") ?? "";
  const isHire = host.startsWith("hire.");
  const body = isHire
    ? recruiterLlmsTxt(`https://${host}`)
    : await studentLlmsTxt();

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      Vary: "Host",
    },
  });
}
