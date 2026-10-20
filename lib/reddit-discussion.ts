const REDDIT_COMMUNITY_URL = "https://www.reddit.com/r/InternshipsPH";
const SEEKING_ADVICE_FLAIR_ID = "8c3ee08a-2e62-11f1-94bb-1a151bdddfab";

/** Build a public community search link; Reddit controls visitor access. */
export function buildRedditCompanySearchUrl(
  companyName?: string | null,
): string | null {
  const company = companyName?.trim();
  if (!company) return null;

  const params = new URLSearchParams({
    q: company,
    restrict_sr: "on",
    sort: "relevance",
  });
  return `${REDDIT_COMMUNITY_URL}/search/?${params.toString()}`;
}

/** Build an editable Reddit draft without publishing anything on the user's behalf. */
export function buildRedditDiscussionUrl({
  companyName,
  jobTitle,
  question,
}: {
  companyName?: string | null;
  jobTitle?: string | null;
  question: string;
}): string {
  const prompt = question.trim();
  if (!prompt) throw new Error("A discussion question is required");

  const company = companyName?.trim() || "Company";
  const position = jobTitle?.trim() || "Internship";
  const params = new URLSearchParams({
    selftext: "true",
    flair_id: SEEKING_ADVICE_FLAIR_ID,
    title: `[Seeking Advice] ${company} - ${position}`.slice(0, 300),
    text: prompt,
  });

  return `${REDDIT_COMMUNITY_URL}/submit?${params.toString()}`;
}
