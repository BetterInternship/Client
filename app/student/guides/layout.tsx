import type { ReactNode } from "react";
import { GuidesShell } from "@/components/guides/guides-shell";

/** Keep Guides within the student root for client navigation and provider lifetime.
 * Do not add an html/body root or duplicate student providers here. */
export default function GuidesLayout({ children }: { children: ReactNode }) {
  return <GuidesShell>{children}</GuidesShell>;
}
