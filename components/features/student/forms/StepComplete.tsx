import { Button } from "@/components/ui/button";

export function StepComplete({
  onMyForms,
  onClose,
}: {
  onMyForms: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative mt-2">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-200 grid place-items-center animate-[pop_420ms_ease-out]">
          <svg
            className="w-10 h-10 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M20 6L9 17l-5-5"
              className="animate-[draw_420ms_ease-out_120ms_forwards] opacity-0"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-4">Submitted</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Please view the My Forms tab to track the status of your submission.
      </p>

      <div className="mt-6 gap-2">
        <Button
          type="button"
          onClick={onMyForms}
          className="rounded-[0.33em] bg-primary px-4 py-2 text-white text-sm font-medium hover:bg-primary/80 focus:outline-none"
        >
          Go to My Forms
        </Button>
      </div>

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0.8);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes draw {
          0% {
            stroke-dasharray: 0 32;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 32 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
