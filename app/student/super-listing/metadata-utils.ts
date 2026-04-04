import type { Metadata } from "next";

type SuperListingMetadataInput = {
  slug: string;
  title: string;
  description: string;
  socialTitle?: string;
};

export function createSuperListingMetadata({
  slug,
  title,
  description,
  socialTitle,
}: SuperListingMetadataInput): Metadata {
  const resolvedSocialTitle = socialTitle || title;
  const imageUrl = `/super-listing/og/${slug}`;
  const canonicalUrl = `/super-listing/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: resolvedSocialTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: resolvedSocialTitle,
        },
      ],
      siteName: "BetterInternship",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedSocialTitle,
      description,
      images: [imageUrl],
    },
  };
}
