import { redirect } from "next/navigation";

// A bare /top has nothing to show (plan D22: no index page) — send it
// somewhere useful, same as an unpublished/unknown slug (D7).
export default function TopIndexPage() {
  redirect("/search");
}
