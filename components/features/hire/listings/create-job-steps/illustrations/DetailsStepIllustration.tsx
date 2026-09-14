import React from "react";

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const DetailsStepIllustration: React.FC<IllustrationProps> = ({
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
        <clipPath id="details-clip">
          <rect x="0" y="0" width="200" height="110" />
        </clipPath>
      </defs>

      <g clipPath="url(#details-clip)">
        {/* Soft background glow */}
        <path
          d="M 30 40 C 30 15, 160 10, 175 45 C 190 75, 150 115, 95 110 C 40 105, 30 70, 30 40 Z"
          className="fill-primary/10"
        />

        {/* Occluded Bulleted List Snippet (Sticking up from card below at y = 110) */}
        <rect
          x="42"
          y="52"
          width="112"
          height="65"
          rx="8"
          className="fill-background stroke-foreground"
          strokeWidth="2.5"
        />

        {/* List Content */}
        <g>
          {/* Active Bullet Item */}
          <circle cx="56" cy="70" r="3.5" className="fill-primary" />
          <rect
            x="66"
            y="68"
            width="72"
            height="4.5"
            rx="2"
            className="fill-foreground"
          />

          {/* Secondary Bullet Items */}
          <circle cx="56" cy="86" r="3.5" className="fill-primary" />
          <rect
            x="66"
            y="84"
            width="54"
            height="4.5"
            rx="2"
            className="fill-foreground/40"
          />

          <circle cx="56" cy="102" r="3.5" className="fill-foreground/30" />
          <rect
            x="66"
            y="100"
            width="64"
            height="4.5"
            rx="2"
            className="fill-foreground/40"
          />
        </g>

        {/* Floating Focused Rich-Text Formatting Badge */}
        <g transform="translate(75, 14) rotate(-5)">
          <rect
            x="0"
            y="0"
            width="92"
            height="40"
            rx="8"
            className="fill-background stroke-foreground"
            strokeWidth="2.5"
          />

          {/* Active Bold Button */}
          <rect
            x="6"
            y="6"
            width="26"
            height="28"
            rx="5"
            className="fill-primary"
          />
          <text
            x="14"
            y="25"
            className="fill-background font-black"
            fontSize="15"
            fontFamily="sans-serif"
          >
            B
          </text>

          {/* Italic Button */}
          <text
            x="40"
            y="25"
            className="fill-foreground font-bold italic font-serif"
            fontSize="15"
          >
            I
          </text>

          {/* Underline Button */}
          <text
            x="56"
            y="25"
            className="fill-foreground font-bold underline"
            fontSize="15"
            fontFamily="sans-serif"
          >
            U
          </text>

          {/* Divider & List Icon Accent */}
          <line
            x1="73"
            y1="10"
            x2="73"
            y2="30"
            className="stroke-foreground/20"
            strokeWidth="1.5"
          />
          <circle cx="81" cy="16" r="1.5" className="fill-foreground" />
          <circle cx="81" cy="24" r="1.5" className="fill-foreground" />
        </g>

        {/* Notion Sparkles */}
        <path
          d="M 32 18 Q 32 26 40 26 Q 32 26 32 34 Q 32 26 24 26 Q 32 26 32 18 Z"
          className="fill-primary"
        />
        <path
          d="M 172 12 Q 172 18 178 18 Q 172 18 172 24 Q 172 18 166 18 Q 172 18 172 12 Z"
          className="fill-primary"
        />
        <circle cx="184" cy="32" r="2.5" className="fill-foreground" />
      </g>
    </svg>
  );
};
