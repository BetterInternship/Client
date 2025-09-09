"use client";

import { SimpleBrowser } from "./simple-browser";
import { SideCopy, SearchPreview } from "./mock-website";

export function Feature() {
  return (
    <section className="relative isolate w-full bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20">
      {/* orbs */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <span className="absolute top-30 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-blue-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Side copy */}
          <div className="lg:col-span-3">
            <SideCopy />
          </div>

          {/* Browser */}
          <div className="lg:col-span-9">
            <SimpleBrowser>
              <div className="lg:h-[75vh]">
                <SearchPreview />
              </div>
            </SimpleBrowser>
          </div>
        </div>
      </div>
    </section>
  );
}
