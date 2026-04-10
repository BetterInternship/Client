"use client";

import { cn } from "@/lib/utils";
import planeImage from "@/public/student/images/plane.png";
import skyBgImage from "@/public/student/images/sky-bg.png";

type HeroCloudFieldProps = {
  className?: string;
};

const PLANE_TEXTURE_PATH = planeImage.src;
const SKY_BG_PATH = skyBgImage.src;

export function HeroCloudField({ className }: HeroCloudFieldProps) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0">
        <img src={SKY_BG_PATH} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(7,24,52,0.5)_0%,rgba(7,24,52,0.24)_40%,rgba(7,24,52,0.1)_65%,rgba(255,255,255,0.05)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(9,33,67,0.48),rgba(9,33,67,0.2)_44%,transparent_76%,rgba(255,255,255,0.08)_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,58,96,0.14),transparent_45%),radial-gradient(ellipse_at_85%_30%,rgba(53,167,255,0.12),transparent_48%)]" />

      <div data-story-hero-plane className="plane-stage">
        <div className="plane-wrapper">
          <img src={PLANE_TEXTURE_PATH} alt="" className="plane-image" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(170,201,225,0)_0%,rgba(170,201,225,0.2)_58%,rgba(170,201,225,0.48)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(198,219,236,0.28))]" />

      <style jsx>{`
        .plane-stage {
          position: absolute;
          inset: 0;
          will-change: transform, opacity;
          pointer-events: none;
        }

        .plane-wrapper {
          position: absolute;
          left: 50%;
          bottom: 17%;
          width: clamp(660px, 84vw, 1380px);
          transform-origin: 70% 52%;
          transform: perspective(1320px) translate3d(-54.5%, 0, 0)
            rotateY(13.5deg) rotateZ(-2.8deg) scale(1.3);
          filter: drop-shadow(0 16px 22px rgba(16, 53, 92, 0.32));
          will-change: transform;
        }

        .plane-image {
          display: block;
          width: 100%;
          height: auto;
          filter: saturate(0.98) contrast(1.08) brightness(0.86);
          user-select: none;
          -webkit-user-drag: none;
        }

        @media (max-width: 767px) {
          .plane-wrapper {
            bottom: 20%;
            width: 184vw;
            transform-origin: 72% 52%;
            transform: perspective(1000px) translate3d(-61.5%, 0, 0)
              rotateY(20deg) rotateZ(-2.6deg) scale(1.34);
          }
        }
      `}</style>
    </div>
  );
}
