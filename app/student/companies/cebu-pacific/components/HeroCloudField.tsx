"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import cloudsBg from "@/public/student/images/clouds-bg.png";
import planeImage from "@/public/student/images/plane.png";

type HeroCloudFieldProps = {
  className?: string;
};

type CloudRowState = {
  row: HTMLElement;
  sprites: HTMLElement[];
  speed: number;
  positions: number[];
};

const CLOUD_TEXTURE_PATH = cloudsBg.src;
const PLANE_TEXTURE_PATH = planeImage.src;

export function HeroCloudField({ className }: HeroCloudFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let pointerTargetX = 0.5;
    let pointerTargetY = 0.5;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let frameId = 0;
    let disposed = false;
    let previousTime = performance.now();

    const rows: CloudRowState[] = Array.from(
      root.querySelectorAll<HTMLElement>("[data-cloud-row]"),
    ).map((row) => {
      const sprites = Array.from(
        row.querySelectorAll<HTMLElement>("[data-cloud-sprite]"),
      );

      return {
        row,
        sprites,
        speed: Number(row.dataset.speed ?? "18"),
        positions: new Array(sprites.length).fill(0),
      };
    });

    const layoutRows = () => {
      rows.forEach((track) => {
        const spriteWidth = track.sprites[0]?.offsetWidth ?? 0;
        if (!spriteWidth) {
          return;
        }

        track.positions = track.sprites.map(
          (_, index) => (index - 1) * spriteWidth,
        );

        track.sprites.forEach((sprite, index) => {
          sprite.style.transform = `translate3d(${track.positions[index]}px, 0px, 0px)`;
        });
      });
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      pointerTargetX = (clientX - rect.left) / rect.width;
      pointerTargetY = (clientY - rect.top) / rect.height;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0.5;
      pointerTargetY = 0.5;
    };

    const render = (now: number) => {
      if (disposed) {
        return;
      }

      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;

      pointerX += (pointerTargetX - pointerX) * 0.06;
      pointerY += (pointerTargetY - pointerY) * 0.06;

      const offsetX = (pointerX - 0.5) * 2;
      const offsetY = (pointerY - 0.5) * 2;

      root.style.setProperty("--cloud-pointer-x", `${offsetX.toFixed(4)}`);
      root.style.setProperty("--cloud-pointer-y", `${offsetY.toFixed(4)}`);

      rows.forEach((track) => {
        const spriteWidth = track.sprites[0]?.offsetWidth ?? 0;
        if (!spriteWidth) {
          return;
        }
        const containerWidth = root.clientWidth;

        for (let index = 0; index < track.sprites.length; index += 1) {
          track.positions[index] += track.speed * delta;
        }

        for (let index = 0; index < track.sprites.length; index += 1) {
          if (track.positions[index] >= containerWidth) {
            const leftmost = Math.min(...track.positions);
            track.positions[index] = leftmost - spriteWidth;
          }
        }

        track.sprites.forEach((sprite, index) => {
          sprite.style.transform = `translate3d(${track.positions[index]}px, 0px, 0px)`;
        });
      });

      frameId = window.requestAnimationFrame(render);
    };

    layoutRows();
    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", layoutRows);
    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", layoutRows);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#58afe6_0%,#72c1ef_26%,#9fd6f7_60%,#dff1ff_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(255,240,183,0.92),rgba(255,240,183,0.18)_18%,transparent_38%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,70,132,0.18),transparent_24%,transparent_70%,rgba(255,255,255,0.18)_100%)]" />

      <div className="absolute inset-0 perspective-[1800px]">
        <div className="cloud-stage absolute inset-[-6%_-8%_-3%_-8%]">
          <div
            className="cloud-row cloud-row-back"
            data-cloud-row
            data-speed="8"
          >
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
          </div>
          <div
            className="cloud-row cloud-row-mid"
            data-cloud-row
            data-speed="14"
          >
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
          </div>
          <div className="plane-wrapper">
            <img src={PLANE_TEXTURE_PATH} alt="" className="plane-image" />
          </div>
          <div
            className="cloud-row cloud-row-front"
            data-cloud-row
            data-speed="20"
          >
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
          </div>
          <div
            className="cloud-row cloud-row-glow"
            data-cloud-row
            data-speed="10"
          >
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
            <div className="cloud-sprite" data-cloud-sprite>
              <img src={CLOUD_TEXTURE_PATH} alt="" className="cloud-image" />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_48%,rgba(255,255,255,0.2)_100%)]" />

      <style jsx>{`
        .cloud-stage {
          transform: translate3d(
              calc(var(--cloud-pointer-x, 0) * 18px),
              calc(var(--cloud-pointer-y, 0) * -14px),
              0
            )
            rotateY(-18deg) rotateX(1.5deg) scale(1.04);
          transform-style: preserve-3d;
        }

        .cloud-row {
          position: absolute;
          inset: auto 0 0 0;
          pointer-events: none;
        }

        .cloud-sprite {
          position: absolute;
          left: 0;
          bottom: 0;
          width: min(84vw, 1180px);
          will-change: transform;
        }

        .cloud-image {
          display: block;
          width: 100%;
          height: auto;
          max-width: none;
          user-select: none;
          -webkit-user-drag: none;
        }

        .cloud-row-back {
          bottom: 20%;
          opacity: 0.42;
          filter: blur(2px) saturate(0.95);
        }

        .cloud-row-mid {
          bottom: 8%;
          opacity: 0.88;
          filter: saturate(0.94) contrast(1.05);
        }

        .plane-wrapper {
          position: absolute;
          left: 18%;
          bottom: 40%;
          width: clamp(320px, 46vw, 620px);
          opacity: 0.98;
          transform: translate3d(
              calc(var(--cloud-pointer-x, 0) * 28px),
              calc(var(--cloud-pointer-y, 0) * -12px),
              110px
            )
            rotate(-2deg);
          filter: drop-shadow(0 18px 28px rgba(31, 86, 132, 0.24));
          will-change: transform;
          animation: planeHover 6.4s ease-in-out infinite;
        }

        .plane-image {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
          -webkit-user-drag: none;
        }

        .cloud-row-front {
          left: 0;
          bottom: -3%;
          opacity: 0.72;
          filter: contrast(1.06);
        }

        .cloud-row-front .cloud-sprite {
          width: min(92vw, 1280px);
        }

        .cloud-row-glow {
          bottom: 6%;
          opacity: 0.28;
          filter: blur(12px) brightness(1.06);
          mix-blend-mode: screen;
        }

        @keyframes planeHover {
          0%,
          100% {
            transform: translate3d(
                calc(var(--cloud-pointer-x, 0) * 28px),
                calc(var(--cloud-pointer-y, 0) * -12px + 0px),
                110px
              )
              rotate(-2deg);
          }
          50% {
            transform: translate3d(
                calc(var(--cloud-pointer-x, 0) * 28px + 8px),
                calc(var(--cloud-pointer-y, 0) * -12px - 16px),
                110px
              )
              rotate(0.5deg);
          }
        }

        @media (max-width: 767px) {
          .cloud-stage {
            transform: translate3d(
                calc(var(--cloud-pointer-x, 0) * 12px),
                calc(var(--cloud-pointer-y, 0) * -8px),
                0
              )
              rotateY(-12deg) rotateX(1deg) scale(1.02);
          }

          .cloud-sprite {
            width: 136vw;
          }

          .cloud-row-back {
            bottom: 24%;
          }

          .cloud-row-mid {
            bottom: 10%;
          }

          .cloud-row-front {
            left: -6%;
            bottom: 1%;
          }

          .cloud-row-glow {
            bottom: 10%;
          }

          .plane-wrapper {
            left: 6%;
            bottom: 44%;
            width: 78vw;
          }
        }
      `}</style>
    </div>
  );
}
