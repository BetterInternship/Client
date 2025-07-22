"use client";
import Link from "next/link";
import { Typewriter } from "@/components/landingHire/sections/7thSection/typewriter-effect";

export function Preview() {
  return (
    <div className="flex flex-col border-t border-gray-700 items-center justify-center min-h-[18rem] py-24 bg-black text-white">
      <p className="text-gray-400 text-base mt-6 text-center max-w-xl">
        Instantly discover internships that match your interests—no more endless
        searching, emails, or paperwork.
      </p>
      <div className="md:text-4xl lg:text-5xl sm:text-3xl pt-4 text-2xl mb-8 text-center w-full flex items-center justify-center">
        <span>{"Ready to "}</span>
        <Typewriter
          text={[
            " find your dream internship?",
            " apply instantly?",
            " get hired faster?",
          ]}
          speed={70}
          className="text-white"
          waitTime={1500}
          deleteSpeed={40}
          cursorChar={"_"}
        />
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
        <Link href="/search">
          <button className="w-48 h-12 rounded-xl bg-white text-black border border-white text-base font-semibold hover:bg-gray-100 transition">
            Find Internships
          </button>
        </Link>
      </div>
    </div>
  );
}