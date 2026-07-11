"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toastPresets } from "@/components/ui/sonner-toast";
import { DiscordService } from "@/lib/api/discord.api";

export function ConnectedAccountsSection() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);
  const status = useQuery({
    queryKey: ["discord-link"],
    queryFn: () => DiscordService.getLinkStatus(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const connect = () => {
    window.location.assign(DiscordService.authorizationUrl());
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const result = await DiscordService.unlink();
      if (!result.success) {
        toast.error(result.message || "Could not disconnect Discord.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["discord-link"] });
      toast.success("Discord disconnected.", toastPresets.success);
    } finally {
      setDisconnecting(false);
    }
  };

  if (status.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking Discord connection...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#061858]">Discord</p>
        <p className="text-sm text-muted-foreground">
          {status.data?.linked
            ? "Connected for one-click applications."
            : "Connect Discord to apply directly from listing announcements."}
        </p>
      </div>
      {status.data?.linked ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => void disconnect()}
          disabled={disconnecting}
        >
          {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
          Disconnect
        </Button>
      ) : (
        <Button type="button" onClick={connect}>
          Connect Discord
        </Button>
      )}
    </div>
  );
}
