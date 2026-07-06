import { FormCheckbox } from "@/components/EditForm";

export function LandingFeatureMassApply() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-muted p-5">
      <div className="w-full max-w-5xl rounded-[0.33em] border border-slate-200 bg-white shadow-xl">
        <div className="grid grid-cols-[48px_1.4fr_1.2fr__1fr] items-center px-2 py-3 text-sm text-slate-800">
          <div className="flex justify-center">
            <FormCheckbox checked={true} />
          </div>
          <div>
            <p className="font-medium">Alicia Tan</p>
          </div>
          <div className="flex flex-col">
            <span>Computer Science</span>
          </div>
          <div>
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
              Shortlisted
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[48px_1.4fr_1.2fr__1fr] items-center px-2 py-3 text-sm text-slate-800">
          <div className="flex justify-center">
            <FormCheckbox checked={true} />
          </div>
          <div>
            <p className="font-medium">Alex Rivera</p>
          </div>
          <div className="flex flex-col">
            <span>Psychology</span>
          </div>
          <div>
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
              Shortlisted
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[48px_1.4fr_1.2fr__1fr] items-center px-2 py-3 text-sm text-slate-800">
          <div className="flex justify-center">
            <FormCheckbox checked={true} />
          </div>
          <div>
            <p className="font-medium">Maya Lin</p>
          </div>
          <div className="flex flex-col">
            <span>Accountancy</span>
          </div>
          <div>
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
              Shortlisted
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-4 rounded-[0.33em] border border-slate-200 bg-white/95 p-2 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-[0.33em] border border-slate-200 bg-white text-slate-700"
            >
              ×
            </button>
            <span className="font-medium text-slate-700">24 selected</span>
            <button
              type="button"
              className="h-9 rounded-[0.33em] border border-slate-200 bg-white px-3 font-medium text-slate-700"
            >
              Unselect all
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 rounded-[0.33em] border border-slate-200 bg-white px-3 text-slate-700"
            >
              Set status
            </button>
            <button
              type="button"
              className="h-9 rounded-[0.33em] border border-slate-200 bg-white px-3 text-slate-700"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
