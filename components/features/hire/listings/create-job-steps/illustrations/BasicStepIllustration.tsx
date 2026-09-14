import React from "react";

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const BasicStepIllustration: React.FC<IllustrationProps> = ({
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
        {/* Clips all elements flush at y = 110 */}
        <clipPath id="basic-info-clip">
          <rect x="0" y="0" width="200" height="110" />
        </clipPath>
      </defs>

      <g clipPath="url(#basic-info-clip)">
        {/* Soft background glow */}
        <path
          d="M 30 40 C 30 10, 160 10, 175 45 C 190 75, 150 115, 95 110 C 40 105, 30 70, 30 40 Z"
          className="fill-primary/10"
        />

        {/* Backing Card cutout (sit behind pencil) */}
        <rect
          x="32"
          y="20"
          width="85"
          height="100"
          rx="8"
          className="fill-background stroke-foreground"
          strokeWidth="2.5"
          transform="rotate(-6 74 70)"
        />
        <g transform="rotate(-6 74 70)">
          <rect
            x="42"
            y="32"
            width="35"
            height="4"
            rx="2"
            className="fill-primary"
          />
          <rect
            x="42"
            y="42"
            width="55"
            height="3"
            rx="1.5"
            className="fill-foreground/30"
          />
          <rect
            x="42"
            y="50"
            width="45"
            height="3"
            rx="1.5"
            className="fill-foreground/30"
          />
        </g>

        {/* Stroke being drawn */}
        <path
          d="M 25 94 C 50 86, 75 92, 110 88"
          className="stroke-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pencil anchored at tip (110, 88) */}
        <g transform="translate(110, 88) rotate(-28)">
          {/* Wood Tip */}
          <path
            d="M 0 0 L -8 -18 L 8 -18 Z"
            className="fill-primary/20 stroke-foreground"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Graphite Lead Tip (touches stroke precisely at 0,0) */}
          <path d="M 0 0 L -3.5 -8 L 3.5 -8 Z" className="fill-foreground" />
          {/* Pencil Body */}
          <rect
            x="-8"
            y="-68"
            width="16"
            height="50"
            rx="1"
            className="fill-background stroke-foreground"
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="-68"
            x2="0"
            y2="-18"
            className="stroke-foreground/30"
            strokeWidth="1.5"
          />
          {/* Metal Ferrule */}
          <rect
            x="-8"
            y="-78"
            width="16"
            height="10"
            className="fill-muted stroke-foreground"
            strokeWidth="2.5"
          />
          {/* Eraser */}
          <path
            d="M -8 -78 C -8 -88, 8 -88, 8 -78 Z"
            className="fill-primary stroke-foreground"
            strokeWidth="2.5"
          />
        </g>

        {/* Notion Sparkles */}
        <path
          d="M 165 18 Q 165 26 173 26 Q 165 26 165 34 Q 165 26 157 26 Q 165 26 165 18 Z"
          className="fill-primary"
        />
        <circle cx="178" cy="40" r="2.5" className="fill-foreground" />
      </g>
    </svg>
  );
};
