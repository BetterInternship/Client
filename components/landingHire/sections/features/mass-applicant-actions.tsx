import { FormCheckbox } from "@/components/EditForm";

const rows = [
  { name: "Alicia Tan", major: "Computer Science" },
  { name: "Alex Rivera", major: "Psychology" },
  { name: "Maya Lin", major: "Accountancy" },
];

function Row({
  name,
  major,
  index,
}: {
  name: string;
  major: string;
  index: number;
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm text-slate-800 rounded-[0.33em] border border-slate-200 bg-white shadow-xl"
      style={{
        width: `${100 - 10 * index}%`,
        filter: `blur(${index * 0.5}px)`,
        opacity: 1 - index * 0.12,
        transform: `translateY(${-18 * (index - 1)}px)`,
        zIndex: rows.length - index,
      }}
    >
      <div className="hidden md:block w-6 text-center text-slate-400 tabular-nums shrink-0">
        {index}
      </div>
      <FormCheckbox checked={true} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{name}</p>
      </div>
      <div className="hidden md:block text-sm flex-[1.2] min-w-0">
        <span className="truncate">{major}</span>
      </div>
      <div className="shrink-0">
        <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-medium text-indigo-700 whitespace-nowrap">
          Shortlisted
        </span>
      </div>
    </div>
  );
}

export function LandingFeatureMassApply() {
  return (
    <div className="relative flex flex-col h-full w-full items-center justify-center bg-muted p-3 md:p-5">
      <div className="flex flex-col items-center gap-2 w-full max-w-sm md:max-w-lg">
        {rows.map((row, i) => (
          <Row key={row.name} {...row} index={i + 1} />
        ))}
      </div>

      <div className="rounded-[0.33em] border border-slate-200 bg-white/95 p-1.5 md:p-2 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between gap-8 text-xs md:text-sm">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              className="hidden md:inline-flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-[0.33em] border border-slate-200 bg-white text-slate-700"
            >
              ×
            </button>
            <span className="font-medium text-slate-700 whitespace-nowrap">
              24 selected
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              className="h-7 md:h-9 rounded-[0.33em] border border-slate-200 bg-white px-2 md:px-3 text-slate-700 text-xs md:text-sm"
            >
              Set status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
