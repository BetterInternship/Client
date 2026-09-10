import { APIClient, APIRouteBuilder } from "./api-client";
import type { FetchResponse } from "./use-fetch";

type LinkResolutionResponse = FetchResponse & {
  url?: string | null;
};

export const LinksService = {
  async resolve(slug: string): Promise<string | null> {
    const response = await APIClient.get<LinkResolutionResponse>(
      APIRouteBuilder("links").r(slug).build(),
      { cache: "no-store" },
    );
    return response.url ?? null;
  },

  secureAccessUrl(
    employerUserId: string,
    hash: string,
    params: { next?: string; auto_link?: string } = {},
  ) {
    return APIRouteBuilder("auth")
      .r(
        "secure-access",
        encodeURIComponent(employerUserId),
        encodeURIComponent(hash),
      )
      .p(params)
      .build();
  },
};
