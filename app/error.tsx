"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import errorImg from "@/public/error.png";

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
    <div className="flex flex-col gap-4 justify-center items-center min-h-screen">
      <Card className="flex flex-col gap-4 p-12">
        <Image src={errorImg} alt="Error" className="w-96 mx-auto" />
        <div className="flex gap-3 items-center">
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
          <span className="text-muted-foreground">Error: {error.message}</span>
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
