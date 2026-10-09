import Image from "next/image";
import { TopPageBackdrop } from "@/components/features/student/top/TopArtwork";
import styles from "./homepage-artwork.module.css";

const landingSprites = {
  badge: {
    src: "/homepage/hero-badge.webp",
    width: 640,
    height: 564,
    sizes: "(max-width: 639px) 150px, (max-width: 1023px) 300px, 420px",
  },
  profile: {
    src: "/homepage/hero-profile.webp",
    width: 640,
    height: 434,
    sizes: "(max-width: 639px) 90px, (max-width: 1023px) 180px, 256px",
  },
  cap: {
    src: "/homepage/hero-cap.webp",
    width: 640,
    height: 428,
    sizes: "(max-width: 639px) 80px, 170px",
  },
  squiggle: {
    src: "/homepage/hero-squiggle.webp",
    width: 640,
    height: 264,
    sizes: "56px",
  },
  plane: {
    src: "/homepage/hero-plane.webp",
    width: 640,
    height: 409,
    sizes: "(max-width: 639px) 40px, (max-width: 1023px) 48px, 72px",
  },
  sparkle: {
    src: "/homepage/hero-sparkle.webp",
    width: 640,
    height: 667,
    sizes: "20px",
  },
  bulb: {
    src: "/homepage/landing-bulb.webp",
    width: 480,
    height: 513,
    sizes: "(max-width: 639px) 64px, (max-width: 1023px) 96px, 120px",
  },
} as const;

export type LandingSpriteName = keyof typeof landingSprites;
export type LandingSpritePlacement = "testimonials" | "faq";

export function HomepageArtwork() {
  return (
    <>
      <div className={styles.backdrop} aria-hidden="true">
        <TopPageBackdrop />
      </div>
      <div className={styles.canvas} aria-hidden="true">
        {(
          ["badge", "profile", "squiggle", "sparkle", "plane", "cap"] as const
        ).map((name) => (
          <Image
            key={name}
            src={landingSprites[name].src}
            width={landingSprites[name].width}
            height={landingSprites[name].height}
            sizes={landingSprites[name].sizes}
            className={`${styles.sprite} ${styles[name]}`}
            alt=""
            priority={name === "badge" || name === "profile"}
          />
        ))}
      </div>
    </>
  );
}

export function HomepageSectionSprite({
  name,
  placement,
}: {
  name: Extract<LandingSpriteName, "bulb">;
  placement: LandingSpritePlacement;
}) {
  return (
    <div className={styles.sectionArt} aria-hidden="true">
      <Image
        src={landingSprites[name].src}
        width={landingSprites[name].width}
        height={landingSprites[name].height}
        sizes={landingSprites[name].sizes}
        className={`${styles.sprite} ${styles[placement]}`}
        alt=""
      />
    </div>
  );
}
