import fs from "node:fs";
import path from "node:path";

export type SuperListingOgConfig = {
  company: string;
  role: string;
  tagline: string;
  accent: string;
  glow: string;
  badgeLabel?: string;
  logoFile?: string;
  logoDataUrl?: string;
};

const SUPER_LISTING_ROOT = path.join(
  process.cwd(),
  "app/student/super-listing",
);

let cachedSlugs: string[] | null = null;
const logoDataUrlCache = new Map<string, string | undefined>();

const SUPER_LISTING_OG_OVERRIDES: Record<
  string,
  Partial<SuperListingOgConfig>
> = {
  anteriore: {
    company: "Anteriore",
    role: "Startup Product and Engineering Challenge",
    tagline: "Build practical product solutions in a high-growth team.",
    accent: "#1f2937",
    glow: "#6b7280",
  },
  "cebu-pacific": {
    company: "Cebu Pacific",
    role: "Digital Travel Experience Challenge",
    tagline: "Improve the booking, check-in, and support journey.",
    accent: "#0c4a6e",
    glow: "#38bdf8",
  },
  pcc: {
    company: "Philippine Chamber of Commerce",
    role: "Business Innovation Challenge",
    tagline: "Reduce business-process friction with practical execution.",
    accent: "#0f766e",
    glow: "#34d399",
  },
  "sofi-ai": {
    company: "Sofi AI",
    role: "UI/UX Intern",
    tagline: "Build a practical frontend for TikTok hook analysis.",
    accent: "#07C4A7",
    glow: "#35e3ca",
  },
  "sofi-ai-marketing": {
    company: "Sofi AI",
    role: "Marketing Intern",
    tagline: "Build a practical frontend for TikTok hook analysis.",
    accent: "#07C4A7",
    glow: "#35e3ca",
  },
  paraluman: {
    company: "Paraluman News",
    role: "Multilingual News Delivery Challenge",
    tagline:
      "Design faster, more trustworthy multilingual publishing workflows.",
    accent: "#581c87",
    glow: "#c084fc",
  },
  miro: {
    company: "Miro",
    role: "Miro-thon Internship Challenge",
    tagline: "Think fast, prototype boldly, and ship under pressure.",
    accent: "#1d4ed8",
    glow: "#60a5fa",
  },
  fff: {
    company: "Founders For Founders",
    role: "Startup Accelerator Intern",
    tagline: "Scout, network, and help scale the next builder community.",
    accent: "#111827",
    glow: "#f59e0b",
  },
};

const SUPER_LISTING_SLUGS = Object.keys(SUPER_LISTING_OG_OVERRIDES);

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getContentTypeForFile(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return null;
}

function resolveLogoDataUrl(slug: string, configuredLogoFile?: string) {
  if (logoDataUrlCache.has(slug)) {
    return logoDataUrlCache.get(slug);
  }

  const slugDirectory = path.join(SUPER_LISTING_ROOT, slug);
  const candidateFileNames = configuredLogoFile
    ? [configuredLogoFile]
    : [
        "logo.svg",
        "logo.png",
        "logo.webp",
        "logo.jpg",
        "logo.jpeg",
        `${slug}-icon.svg`,
      ];

  for (const candidateFileName of candidateFileNames) {
    const absolutePath = path.join(slugDirectory, candidateFileName);

    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const contentType = getContentTypeForFile(candidateFileName);
    if (!contentType) {
      continue;
    }

    const buffer = fs.readFileSync(absolutePath);
    const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
    logoDataUrlCache.set(slug, dataUrl);
    return dataUrl;
  }

  logoDataUrlCache.set(slug, undefined);
  return undefined;
}

export function getAvailableSuperListingSlugs(): string[] {
  return cachedSlugs || (cachedSlugs = SUPER_LISTING_SLUGS);
}

export function isSuperListingSlug(slug: string): boolean {
  return getAvailableSuperListingSlugs().includes(slug);
}

export function getSuperListingOgConfig(slug: string): SuperListingOgConfig {
  const fallbackCompany = titleCaseFromSlug(slug);
  const fallback: SuperListingOgConfig = {
    company: fallbackCompany,
    role: "Super Listing Challenge",
    tagline: "Take on a real-world challenge and get noticed.",
    accent: "#1d4ed8",
    glow: "#60a5fa",
    badgeLabel: "Super Listing",
  };

  const mergedConfig = {
    ...fallback,
    ...SUPER_LISTING_OG_OVERRIDES[slug],
  };

  return {
    ...mergedConfig,
    logoDataUrl: resolveLogoDataUrl(slug, mergedConfig.logoFile),
  };
}
