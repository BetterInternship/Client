import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";

export function LandingFeaturePipeline() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-muted p-5 pb-0">
      <div className="absolute top-[50%] right-[50%] h-1/2 w-1/3 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>
      <svg viewBox="0 0 300 200" className="w-full max-w-xs md:max-w-sm">
        {[
          { deg: 45, dist: 70, size: 8, fill: "#6366f1" },
          { deg: 135, dist: 60, size: 6, fill: "#818cf8" },
          { deg: 225, dist: 75, size: 7, fill: "#6366f1" },
          { deg: 315, dist: 65, size: 5, fill: "#a5b4fc" },
          { deg: 90, dist: 55, size: 5, fill: "#818cf8" },
          { deg: 270, dist: 50, size: 4, fill: "#a5b4fc" },
          { deg: 20, dist: 80, size: 6, fill: "#6366f1" },
          { deg: 340, dist: 85, size: 4, fill: "#a5b4fc" },
        ].map(({ deg, dist, size, fill }) => {
          const rad = (deg * Math.PI) / 180;
          const x = 150 + Math.cos(rad) * dist;
          const y = 100 + Math.sin(rad) * dist;
          return (
            <g key={`${deg}-${dist}`}>
              <line
                x1={150}
                y1={100}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <circle cx={x} cy={y} r={size} fill={fill} />
            </g>
          );
        })}

        <circle cx="150" cy="100" r="10" fill="#4f46e5" />
        <circle
          cx="150"
          cy="100"
          r="16"
          fill="none"
          stroke="#4f46e5"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  );
}
