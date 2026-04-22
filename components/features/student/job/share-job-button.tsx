"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, CopyCheck } from "lucide-react";
import { useEffect, useState } from "react";

export const ShareJobButton = ({
  id,
  className,
  onCopied,
}: {
  id: string;
  className?: string;
  onCopied?: () => void;
}) => {
  const [clicked, setClicked] = useState(false);

  const copyJobLink = () => {
    void navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_CLIENT_URL}/search/${id}`,
    );
    setClicked(true);
    onCopied?.();
    setTimeout(() => setClicked(false), 1500);
  };

  useEffect(() => {
    setClicked(false);
  }, [id]);

  return (
    <Button
      variant="outline"
      onClick={copyJobLink}
      name="Copy link"
      scheme="default"
      size="md"
      className={cn(
        "!p-4",
        clicked ? "text-supportive border-supportive" : "",
        className,
      )}
    >
      {clicked ? <CopyCheck /> : <Copy />}
      {clicked ? "Copied link" : "Copy link"}
    </Button>
  );
};
