"use client";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/components/landingHire/sections/7thSection/typewriter-effect";

export function CallToAction() {
  const words = [
    { text: "Ready" },
    { text: "to" },
    {
      text: "skip",
      className: "text-green-400 dark:text-green-400 font-bold",
    },
    { text: "the" },
    { text: "admin"},
    { text: "work?"},
  ];
  return (
    <div className="flex flex-col border-t border-gray-900 items-center justify-center min-h-[18rem] py-24 bg-black text-white">
      <p className="text-gray-400 text-base mt-6 text-center max-w-xl">
        Start hiring better interns — without the paperwork, emails and spreadsheets.
      </p>
      <TypewriterEffectSmooth words={words} />

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
        <Link href="/login">
          <button className="w-48 h-12 rounded-xl bg-white text-black border border-white text-base font-semibold hover:bg-gray-100 transition">
            Post Your Internship
          </button>
        </Link>
        <a
          href="https://calendar.app.google/EF3XRLuEti5ac63c8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="w-48 h-12 rounded-xl bg-black text-white border border-white text-base font-semibold flex items-center justify-center hover:bg-gray-900 transition">
            Book a Demo
          </button>
        </a>
      </div>
    </div>
  );
}
