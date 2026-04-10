"use client";

import { cn } from "@/lib/utils";
import planeImage from "@/public/student/images/plane.png";
import skyBgImage from "@/public/student/images/sky-bg.png";

type HeroCloudFieldProps = {
  className?: string;
  showSky?: boolean;
  showAtmosphere?: boolean;
  showBottomGlow?: boolean;
};

const PLANE_TEXTURE_PATH = planeImage.src;
const SKY_BG_PATH = skyBgImage.src;

export function HeroCloudField({
  className,
  showSky = true,
  showAtmosphere = true,
  showBottomGlow = true,
}: HeroCloudFieldProps) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {showSky ? (
        <div className="absolute inset-0">
          <img
            src={SKY_BG_PATH}
            alt=""
            className="h-full w-full object-cover object-bottom"
            data-story-hero-sky
          />
        </div>
      ) : null}
      {showAtmosphere ? (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,31,64,0.44)_0%,rgba(9,31,64,0.22)_52%,rgba(9,31,64,0.1)_100%)]" />
      ) : null}

      <div data-story-hero-plane className="plane-stage">
        <div className="plane-wrapper">
          <img
            src={PLANE_TEXTURE_PATH}
            alt=""
            className="plane-image"
            data-story-hero-plane-image
          />
        </div>
      </div>

      {showBottomGlow ? (
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(180deg,rgba(170,201,225,0)_0%,rgba(170,201,225,0.34)_100%)]" />
      ) : null}

      <style jsx>{`
        .plane-stage {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translate3d(-65vw, -55vh, 0) scale(0.92);
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
