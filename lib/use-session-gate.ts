"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { readSessionHint, subscribeSessionHint } from "@/lib/session-hint";

/**
 * Whether the current route is a Top page. They live at /<university> and
 * /<university>/top/<slug>; a university's URL name can't be told apart from
 * any other first path segment by its text, so this keys off the route itself:
 * only app/student/[university]/** has a `university` param.
 */
export function useIsTopRoute(): boolean {
  return typeof useParams()?.university === "string";
}

/** The stored session hint; false on the server and during hydration. */
export function useSessionHint(): boolean {
  return useSyncExternalStore(
    subscribeSessionHint,
    readSessionHint,
    () => false,
  );
}

/**
 * Whether queries about the signed-in student (profile, saved jobs,
 * applications, waitlists) may run on this route
 * (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md D10). Everywhere on the
 * student site except Top pages the answer is yes; on a Top page it is yes
 * only when the browser carries the session hint, so a logged-out view of the
 * cached page makes no API calls at all.
 */
export function useStudentQueriesEnabled(): boolean {
  const onTopRoute = useIsTopRoute();
  const hint = useSessionHint();
  return !onTopRoute || hint;
}
