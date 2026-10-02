import { ArrowRight } from "lucide-react";
import { BI_DISCORD_INVITE } from "@/constants";
import { TopDiscordArtwork } from "./TopArtwork";
import { Button, cn } from "@betterinternship/components";
import { DiscordMark } from "./DiscordMark";
import motionStyles from "./top-motion.module.css";

export function TopDiscordCTA() {
  return (
    <section
      aria-labelledby="top-discord-heading"
      className="relative mt-8 flex flex-col items-center gap-5 overflow-hidden rounded-[0.33em] border border-blue-100 bg-[linear-gradient(120deg,#d8ebff_0%,#f4faff_42%,#d5eaff_100%)] px-6 py-6 sm:min-h-[164px] sm:flex-row sm:gap-7 sm:py-5 lg:px-7"
    >
      <div className="relative h-[150px] w-[200px] shrink-0 sm:absolute sm:bottom-0 sm:left-3 sm:h-[165px] sm:w-[220px]">
        <TopDiscordArtwork />
      </div>
      <div className="relative flex-1 text-center sm:ml-52 sm:text-left">
        <h2
          id="top-discord-heading"
          className="mt-1 text-xl font-semibold tracking-tight text-[#101033] sm:text-[22px]"
        >
          Get notified when new internships drop.
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Join our Discord for new internship alerts, and apply in 1 click ⚡
        </p>
      </div>
      <Button
        asChild
        size="lg"
        className={cn(
          motionStyles.action,
          "relative w-full shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto",
        )}
      >
        <a href={BI_DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          <DiscordMark className="h-5 w-5" /> Join Discord{" "}
          <ArrowRight
            className={cn("h-4 w-4", motionStyles.arrow)}
            aria-hidden="true"
          />
        </a>
      </Button>
    </section>
  );
}
