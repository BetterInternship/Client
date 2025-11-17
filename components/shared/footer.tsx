"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";

type FooterLink = { label: string; href: string; className?: string };

const LINKS: FooterLink[] = [
  { label: "Privacy", href: "/PrivacyPolicy.pdf" },
  { label: "Terms", href: "/TermsConditions.pdf" },
  {
    label: "Need help?",
    href: "https://www.facebook.com/profile.php?id=61579853068043",
    className: "text-primary",
  },
];

export function Footer({
  links = LINKS,
  theme = "light"
} : { 
  links?: FooterLink[];
  theme: "light" | "dark";
}) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(
      "py-1 px-5",
      theme === "light"
        ? ""
        : "bg-black"
    )}>
      <div className="mx-auto">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <p className={cn(
              "text-xs",
              theme === "light"
                ? "text-muted-foreground"
                : "text-gray-300"
            )}>
              © {year} BetterInternship Inc.
            </p>
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={`
                    hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm 
                    ${l.className ?? ""}
                    ${
                      theme === "light"
                        ? "text-muted-foreground"
                        : "text-gray-300"
                    }
                  `}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
