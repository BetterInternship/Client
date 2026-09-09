import { APIClient, APIRouteBuilder } from "./api-client";
import type { FetchResponse } from "./use-fetch";

export type DiscordLinkStatusResponse = FetchResponse & {
  linked?: boolean;
};

export type DiscordAuthorizationUrlResponse = FetchResponse & {
  authorizationUrl?: string;
};

export const DiscordService = {
  getLinkStatus() {
    return APIClient.get<DiscordLinkStatusResponse>(
      APIRouteBuilder("integrations").r("discord", "status").build(),
    );
  },

  unlink() {
    return APIClient.delete<FetchResponse>(
      APIRouteBuilder("integrations").r("discord", "link").build(),
    );
  },

  completeSetup(jobId: string) {
    return APIClient.post<FetchResponse>(
      APIRouteBuilder("integrations").r("discord", "setup", "complete").build(),
      { job_id: jobId },
    );
  },

  authorizationUrl(jobId?: string) {
    return APIRouteBuilder("integrations")
      .r("discord", "oauth", "start")
      .p({ job_id: jobId })
      .build();
  },

  getMobileAuthorizationUrl(jobId?: string) {
    return APIClient.get<DiscordAuthorizationUrlResponse>(
      APIRouteBuilder("integrations")
        .r("discord", "oauth", "start")
        .p({ job_id: jobId, mobile: true })
        .build(),
    );
  },
};
