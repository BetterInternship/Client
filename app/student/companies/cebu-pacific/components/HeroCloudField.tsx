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
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(7,24,52,0.5)_0%,rgba(7,24,52,0.2)_40%,rgba(7,24,52,0.08)_65%,rgba(255,255,255,0.06)_100%)] mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_62%,transparent_32%,rgba(2,10,22,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(255,226,132,0.22),transparent_36%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(255,225,124,0.4),rgba(255,225,124,0.06)_24%,transparent_46%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(9,33,67,0.48),rgba(9,33,67,0.2)_44%,transparent_76%,rgba(255,255,255,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_66%,transparent_34%,rgba(0,0,0,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(5,16,33,0.28)_100%)]" />
      <div className="absolute right-[-10%] top-[14%] h-[56px] w-[72%] rotate-[-4deg] bg-[linear-gradient(90deg,transparent_0%,rgba(255,229,149,0.36)_46%,rgba(255,229,149,0.08)_72%,transparent_100%)] blur-[8px]" />
      <div className="absolute inset-0 opacity-30 mix-blend-soft-light [background-image:repeating-radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2)_0_1px,transparent_1px_3px),repeating-radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)] [background-size:4px_4px,5px_5px]" />
      <div className="absolute inset-0 opacity-36 [box-shadow:inset_0_0_90px_rgba(255,58,96,0.16),inset_0_0_110px_rgba(53,167,255,0.14)]" />

      <div className="plane-wrapper">
        <img src={PLANE_TEXTURE_PATH} alt="" className="plane-image" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(170,201,225,0)_0%,rgba(170,201,225,0.2)_58%,rgba(170,201,225,0.48)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(198,219,236,0.36))] blur-[10px]" />

      <style jsx>{`
        .plane-wrapper {
          position: absolute;
          left: 50%;
          bottom: 17%;
          width: clamp(660px, 84vw, 1380px);
          transform-origin: 70% 52%;
          transform: perspective(1320px) translate3d(-54.5%, 0, 0)
            rotateY(13.5deg) rotateZ(-2.8deg) scale(1.3);
          filter: drop-shadow(0 34px 56px rgba(16, 53, 92, 0.5));
          will-change: transform;
          animation: planePerspectiveGlide 15s ease-in-out infinite;
        }

        .plane-image {
          display: block;
          width: 100%;
          height: auto;
          filter: saturate(0.98) contrast(1.08) brightness(0.86);
          user-select: none;
          -webkit-user-drag: none;
        }

        @keyframes planePerspectiveGlide {
          0%,
          100% {
            transform: perspective(1320px) translate3d(-54.5%, 0, 0)
              rotateY(13.5deg) rotateZ(-2.8deg) scale(1.3);
          }
          50% {
            transform: perspective(1320px) translate3d(-53.9%, -6px, 0)
              rotateY(13.5deg) rotateZ(-2.8deg) scale(1.3);
          }
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
