"use client";

export function Navigation() {
  return (
    <nav>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16">
          <div className="flex items-center gap-2">
            <img
              src="/BetterInternshipLogo.png"
              className="inline-block h-7 w-7 sm:h-8 sm:w-8"
              alt="BetterInternship logo"
            />
            <div className="font-primary font-bold tracking-tight text-lg sm:text-2xl">
              BetterInternship
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
