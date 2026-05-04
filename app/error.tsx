"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Card className="flex flex-col gap-4 p-12">
        <img src="/error.png" alt="Error" className="mx-auto w-96" />
        <div className="flex items-center gap-3">
          <HeaderIcon icon={TriangleAlert} />
          <HeaderText>Something went wrong.</HeaderText>
        </div>
        <span>
          Sorry for the inconvenience. Please{" "}
          <a href="https://www.facebook.com/betterinternship.sherwin">
            contact us for support
          </a>
          .
        </span>
        {error && (
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground">
              Error: {error.message}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </div>
      </Card>
    </div>
  );
}
