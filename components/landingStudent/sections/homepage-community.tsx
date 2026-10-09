import { CommunitySection } from "@/components/landing/community-section";
import { DiscordMark } from "@/components/features/student/top/DiscordMark";
import { TopDiscordArtwork } from "@/components/features/student/top/TopArtwork";
import discordPhone from "@/public/homepage/discord-phone.webp";
import { BI_DISCORD_INVITE } from "@/constants";

export function HomepageCommunity() {
  return (
    <CommunitySection
      className="mt-24 max-md:mt-14"
      headingId="home-discord-heading"
      heading={
        <>
          Get notified when{" "}
          <span className="text-[#80b4ff]">new internships drop</span> and{" "}
          <span className="text-landing-secondary">
            apply with one click <span aria-hidden="true">⚡</span>
          </span>
        </>
      }
      artwork={
        <TopDiscordArtwork
          phoneSrc={discordPhone}
          phoneSizes="(max-width: 767px) 140px, (max-width: 1023px) 30vw, 370px"
        />
      }
      action={{
        label: "Join the Discord",
        href: BI_DISCORD_INVITE,
        icon: <DiscordMark width={24} height={24} />,
      }}
      data-home-reveal
    />
  );
}
