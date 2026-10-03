import { notFound, redirect } from "next/navigation";
import { isTopSlugShape } from "@/lib/api/top-page.server";

// /<university>/top has no page of its own — the university's landing page
// (/<university>) is the index of its categories.
export default async function TopIndexPage({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  if (!isTopSlugShape(university)) notFound();
  redirect(`/${university}`);
}
