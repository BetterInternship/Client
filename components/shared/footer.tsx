"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type FooterLink = { label: string; href: string };

const LINKS: FooterLink[] = [
  { label: "Privacy", href: "/PrivacyPolicy.pdf" },
  { label: "Terms", href: "/TermsConditions.pdf" },
];

export function Footer({ links = LINKS }: { links?: FooterLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-1 px-5">
      <div className="mx-auto">
        <div className="flex gap-2 justify-center md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {year} BetterInternship Inc.
          </p>

          <p className="text-xs md:hidden text-muted-foreground">•</p>

          <nav aria-label="Footer" className="flex justify-center">
            <ul className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-2 text-xs">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
