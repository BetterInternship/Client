import { APIRouteBuilder } from "./api-client";
import {
  discordIntegrationControllerCompleteSetup,
  discordIntegrationControllerStartOAuth,
  discordIntegrationControllerStatus,
  discordIntegrationControllerUnlink,
} from "./generated/endpoints/discord-integration/discord-integration";

export type {
  DiscordAuthorizationUrlResponse,
  DiscordLinkStatusResponse,
} from "./generated/models";

export const DiscordService = {
  getLinkStatus() {
    return discordIntegrationControllerStatus();
  },

  unlink() {
    return discordIntegrationControllerUnlink();
  },

  completeSetup(jobId: string) {
    return discordIntegrationControllerCompleteSetup({ job_id: jobId });
  },

  authorizationUrl(jobId?: string) {
    return APIRouteBuilder("integrations")
      .r("discord", "oauth", "start")
      .p({ job_id: jobId })
      .build();
  },

  getMobileAuthorizationUrl(jobId?: string) {
    // The generated URL builder keeps an empty string; APIRouteBuilder dropped it.
    return discordIntegrationControllerStartOAuth({
      job_id: jobId || undefined,
      mobile: "true",
    });
  },
};
