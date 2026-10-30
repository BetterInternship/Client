import { NotFoundPage } from "@/components/not-found/not-found-page";

export default function NotFound() {
  return <NotFoundPage header={<FallbackHeader />} />;
}

function FallbackHeader() {
  return (
    <header className="flex min-h-[76px] w-full items-center px-4 md:px-6">
      <a
        href="/"
        className="inline-flex items-center gap-3 text-lg font-[750] tracking-[-.0375rem] text-landing-navy"
      >
        <img src="/homepage-logo.png" width="24" height="24" alt="" />
        BetterInternship
      </a>
    </header>
  );
}
