import React from "react";

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const SetupStepIllustration: React.FC<IllustrationProps> = ({
  className = "w-full h-auto",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 110"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <clipPath id="setup-clip">
          <rect x="0" y="0" width="200" height="110" />
        </clipPath>
      </defs>

      <g clipPath="url(#setup-clip)">
        {/* Soft background glow */}
        <path
          d="M 30 40 C 30 15, 160 10, 175 45 C 190 75, 150 115, 95 110 C 40 105, 30 70, 30 40 Z"
          className="fill-primary/10"
        />

        {/* Large Gear (Setup Metaphor) */}
        <g transform="translate(38, 18)">
          <circle
            cx="32"
            cy="32"
            r="22"
            className="fill-background stroke-foreground"
            strokeWidth="3"
          />
          <circle
            cx="32"
            cy="32"
            r="9"
            className="fill-primary stroke-foreground"
            strokeWidth="2.5"
          />
          <path
            d="M 32 4 L 32 10 M 32 54 L 32 60 M 4 32 L 10 32 M 54 32 L 60 32 M 12 12 L 16 16 M 48 48 L 52 52 M 12 52 L 16 48 M 48 16 L 52 12"
            className="stroke-foreground"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Active Toggle Switch */}
        <g transform="translate(95, 38) rotate(-6)">
          <rect
            x="0"
            y="0"
            width="64"
            height="34"
            rx="17"
            className="fill-primary stroke-foreground"
            strokeWidth="3"
          />
          <circle
            cx="47"
            cy="17"
            r="11"
            className="fill-background stroke-foreground"
            strokeWidth="2.5"
          />
          <path
            d="M 42 17 L 45 20 L 51 14"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Occluded option card sticking out below */}
        <rect
          x="70"
          y="82"
          width="90"
          height="40"
          rx="8"
          className="fill-background stroke-foreground"
          strokeWidth="2.5"
        />
        <circle cx="84" cy="98" r="4" className="fill-primary" />
        <rect
          x="94"
          y="96"
          width="40"
          height="4"
          rx="2"
          className="fill-foreground/40"
        />

        {/* Notion Sparkles */}
        <path
          d="M 165 15 Q 165 24 174 24 Q 165 24 165 33 Q 165 24 156 24 Q 165 24 165 15 Z"
          className="fill-primary"
        />
        <circle cx="178" cy="42" r="2.5" className="fill-foreground" />
      </g>
    </svg>
  );
};
