import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "fff",
  title: "BetterInternship x FFF: Startup Accelerator Intern",
  description:
    "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
});

export default function FFFLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
