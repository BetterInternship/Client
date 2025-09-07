import { ReactNode } from "react";
import { Search } from "lucide-react";

export function SimpleBrowser({ children }: { children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label="BetterInternship — preview"
      className="
        mx-auto w-full max-w-[1100px] overflow-hidden
        rounded-2xl bg-white text-slate-900 ring-1 ring-slate-200
        shadow-[0_16px_60px_-20px_rgba(0,0,0,0.35)]
      "
    >
      {/* desktop chrome */}
      <div className="hidden items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur sm:flex">
        <div className="flex-1">
          <div className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm">
            <Search className="mr-2 h-4 w-4 text-slate-400" aria-hidden />
            <input
              aria-label="Address bar"
              placeholder="https://betterinternship.com/search"
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* mobile chrome */}
      <div className="border-b border-slate-200 bg-white/95 px-3 py-2 sm:hidden">
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs">
          <div className="flex items-center">
            <Search className="mr-2 h-3.5 w-3.5 text-slate-400" aria-hidden />
            <input
              aria-label="Address"
              placeholder="betterinternship.com/search"
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* viewport – shell does NOT scroll */}
      <div className="relative lg:h-[75vh]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
}
