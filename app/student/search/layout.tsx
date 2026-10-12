import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Internships in the Philippines | BetterInternship",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
