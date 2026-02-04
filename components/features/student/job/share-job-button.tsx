"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Share } from "lucide-react";
import { useEffect, useState } from "react";

export const ShareJobButton = ({ id }: { id: string }) => {
  const [clicked, setClicked] = useState(false);

  const copyJobLink = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_CLIENT_URL}/search/${id}`,
    );
    setClicked(true);
    setTimeout(() => setClicked(false), 1500);
  };

  useEffect(() => {
    setClicked(false);
  }, [id]);

  return (
    <Button
      variant="ghost"
      onClick={copyJobLink}
      name="Copy link"
      scheme="default"
      size="md"
      className={cn("!p-4", clicked ? "text-supportive" : "text-gray-500")}
    >
      {clicked ? <Check /> : <Share />}
      {clicked ? "Copied link" : "Share"}
    </Button>
  );
};
