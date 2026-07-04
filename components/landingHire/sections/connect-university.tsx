"use client";

import { useRouter } from "next/navigation";

export function ConnectUniversitySection() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex justify-center items-center overflow-hidden px-8">
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="tracking-tighter font-bold leading-none">
            We connect you directly to universities.
          </h1>
          <p>
            Easily and securely get a Memorandum of Agreement with Philippine
            universities &mdash; only on BetterInternship.
          </p>
        </div>
      </div>
    </section>
  );
}
