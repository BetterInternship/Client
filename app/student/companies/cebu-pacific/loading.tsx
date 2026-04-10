export default function Loading() {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#5ea9de] px-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url('/student/images/sky-bg.png')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(165deg,rgba(7,24,52,0.6)_0%,rgba(7,24,52,0.25)_42%,rgba(7,24,52,0.1)_70%,rgba(255,255,255,0.08)_100%)]"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center">
        <h1 className="text-balance text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-white">
          Ready for your dream internship?
        </h1>

        <div className="relative h-12 w-12">
          <span className="absolute inset-0 rounded-full border border-white/30" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white/80 animate-spin" />
        </div>
      </div>
    </main>
  );
}
