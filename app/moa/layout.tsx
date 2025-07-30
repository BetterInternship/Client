import "../globals.css";
import type { Metadata } from "next";
import { HTMLContent } from "./html";

export const metadata: Metadata = {
  title: "MOA Management Platform",
  description: "Manage company MOAs",
  // icons: {
  //   icon: "/BetterInternshipLogo.ico",
  // },
};

/**
 * Hire root layout
 *
 * @component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HTMLContent>{children}</HTMLContent>;
}
