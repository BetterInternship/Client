"use client";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 py-1 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img
              src="/BetterInternshipLogo.png"
              className="w-8 h-8 inline-block"
            ></img>
            <div className="text-2xl font-bold font-primary tracking-tight">
              BetterInternship
            </div>
          </div>

          <div className="flex items-center space-x-4"></div>
        </div>
      </div>
    </nav>
  );
}
