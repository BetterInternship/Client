import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Button } from "./button";

export const PageError = ({
  title,
  description,
  image = false,
  flush = false,
  topAlign = false,
  onRetry,
}: {
  title: string;
  description: string;
  // Shows /error.png beneath the text.
  image?: boolean;
  // Card fills its container edge-to-edge instead of capping at max-w-md
  // with breathing room around it.
  flush?: boolean;
  // Aligns content to the top of the card instead of vertically centering
  // it (flush mode only).
  topAlign?: boolean;
  // Shows a "Retry" button that calls this when clicked.
  onRetry?: () => void;
}) => {
  return (
    <div
      className={cn(
        "animate-fade-in",
        flush ? "h-full text-left" : "py-16 text-center",
      )}
    >
      <Card
        className={cn(
          "m-auto",
          flush
            ? cn(
                "w-full h-full flex flex-col items-start",
                topAlign ? "justify-start" : "justify-center",
              )
            : "max-w-md",
        )}
      >
        <h3 className="w-full text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="w-full text-red-600 mb-4">{description}</p>
        {image && (
          <img
            src="/error.png"
            alt=""
            className={cn("w-full max-w-[240px] mb-4", !flush && "mx-auto")}
          />
        )}
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Card>
    </div>
  );
};
