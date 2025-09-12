"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/god/verified", label: "Verified employers" },
  { href: "/god/unverified", label: "Unverified employers" },
  { href: "/god/students", label: "Students" },
  { href: "/god/applications", label: "Applications" },
];

export default function TabsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="mx-auto px-4">
        <nav className="flex flex-wrap gap-1 py-2">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-gray-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
