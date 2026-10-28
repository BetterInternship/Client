import { googleLoginUrl } from "@/lib/api/urls";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";

/**
 * Starts Google login and remembers the current page to return to afterward.
 * Optionally remembers an Apply, Save, or Alert action for a specific job in this tab.
 * After login, a matching intent can be used once within 30 minutes: Apply
 * reopens the application flow without submitting; Save can save the job
 * automatically after confirming it is not already saved. Alert can enable
 * notifications if they are not already enabled.
 * Session verification is handled separately by the student auth context.
 */

const INTENT_KEY = "bi.student-job-intent";
type JobIntentAction = "apply" | "save" | "alert";

export function startStudentLogin(intent?: {
  action: JobIntentAction;
  jobId: string | undefined;
}) {
  const destination = new URL(
    `${window.location.pathname}${window.location.search}`,
    "https://student.invalid",
  );
  // Search's selected listing can live in component state; restore it explicitly.
  if (
    intent?.jobId &&
    /^\/(?:student\/)?search\/?$/.test(destination.pathname)
  ) {
    destination.searchParams.set("jobId", intent.jobId);
  }
  const path = `${destination.pathname}${destination.search}`;
  savePostLoginRedirect(path);
  try {
    if (intent?.jobId && /^[0-9a-f-]{36}$/i.test(intent.jobId)) {
      sessionStorage.setItem(
        INTENT_KEY,
        JSON.stringify({ ...intent, path, createdAt: Date.now() }),
      );
    } else sessionStorage.removeItem(INTENT_KEY);
  } catch {
    /* Authentication does not require working session storage. */
  }
  window.location.assign(googleLoginUrl());
}

/** Consume a matching intent once. Apply must still require submission confirmation. */
export function consumeJobLoginIntent(
  action: JobIntentAction,
  jobId: string | undefined,
) {
  if (!jobId) return false;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return false;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") {
      sessionStorage.removeItem(INTENT_KEY);
      return false;
    }
    const intent = value as Record<string, unknown>;
    const valid =
      (intent.action === "apply" ||
        intent.action === "save" ||
        intent.action === "alert") &&
      typeof intent.jobId === "string" &&
      /^[0-9a-f-]{36}$/i.test(intent.jobId) &&
      typeof intent.createdAt === "number" &&
      Date.now() - intent.createdAt >= 0 &&
      Date.now() - intent.createdAt < 30 * 60_000;
    if (!valid) {
      sessionStorage.removeItem(INTENT_KEY);
      return false;
    }
    if (
      intent.action !== action ||
      intent.jobId !== jobId ||
      intent.path !== `${window.location.pathname}${window.location.search}`
    )
      return false;
    sessionStorage.removeItem(INTENT_KEY);
    return true;
  } catch {
    return false;
  }
}
