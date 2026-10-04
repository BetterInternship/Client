import { Inter } from "next/font/google";

/**
 * The site font, self-hosted by Next at build time instead of fetched from
 * Google at runtime (a render-blocking @import used to cost every page two
 * third-party round trips before first paint). Inter is a variable font, so
 * one file covers every weight. Exposed as `--font-inter`; app/globals.css
 * points `--font-sans` and `--font-heading` at it. Put `inter.variable` on the
 * <html> element of every root layout.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
