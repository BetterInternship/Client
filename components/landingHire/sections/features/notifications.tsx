export function LandingFeatureNotifications() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-muted p-5 pb-0">
      <div className="absolute top-[50%] right-[25%] h-1/2 w-1/3 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />
      <div className="relative bg-white rounded-[0.33em] px-4 py-2 shadow-xl">
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white" />
        <p className="font-semibold tracking-tighter text-sm md:text-lg">
          5 Applicants Ready for Review
        </p>
      </div>
    </div>
  );
}
