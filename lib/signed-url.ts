"use client";

import { useEffect, useState } from "react";

const BUCKET_PREFIX =
  "https://storage.googleapis.com/better-internship-public-bucket/";

export const isBucketUrl = (url: string): boolean =>
  typeof url === "string" && url.startsWith(BUCKET_PREFIX);

type CacheEntry = { signedUrl: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string>>();

const TTL_MS = 28 * 60 * 1000; // 28 min (server signs for 30 min); we make it less so it doesn't 403 on expiry

const resolveFromServer = async (
  urls: string[],
): Promise<Record<string, string>> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/api/users/resolve-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) return {};
  const data = (await res.json()) as { urls?: Record<string, string> };
  return data.urls ?? {};
};

export const resolveSignedUrl = (url: string): Promise<string> => {
  if (!isBucketUrl(url)) return Promise.resolve(url);

  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now())
    return Promise.resolve(cached.signedUrl);

  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = resolveFromServer([url])
    .then((result) => {
      const signedUrl = result[url] ?? url;
      cache.set(url, { signedUrl, expiresAt: Date.now() + TTL_MS });
      inflight.delete(url);
      return signedUrl;
    })
    .catch(() => {
      inflight.delete(url);
      return url;
    });
  inflight.set(url, promise);
  return promise;
};

export const resolveSignedUrls = async (
  urls: string[],
): Promise<Record<string, string>> => {
  const now = Date.now();
  const result: Record<string, string> = {};

  const toFetch: string[] = [];
  for (const url of urls) {
    if (!isBucketUrl(url)) {
      result[url] = url;
      continue;
    }
    const cached = cache.get(url);
    if (cached && cached.expiresAt > now) {
      result[url] = cached.signedUrl;
    } else {
      toFetch.push(url);
    }
  }

  if (toFetch.length) {
    const serverResults = await resolveFromServer(toFetch).catch(
      () => ({}) as Record<string, string>,
    );
    for (const url of toFetch) {
      const signed = serverResults[url] ?? url;
      cache.set(url, { signedUrl: signed, expiresAt: now + TTL_MS });
      result[url] = signed;
    }
  }

  return result;
};

export const useSignedUrl = (url: string) => {
  const [signedUrl, setSignedUrl] = useState(url);
  const [loading, setLoading] = useState(isBucketUrl(url));

  useEffect(() => {
    if (!url) {
      setSignedUrl(url);
      setLoading(false);
      return;
    }
    setLoading(true);
    void resolveSignedUrl(url).then((resolved) => {
      setSignedUrl(resolved);
      setLoading(false);
    });
  }, [url]);

  return { url: signedUrl, loading };
};

export const useSignedUrls = (urls: string[]) => {
  const key = urls.join("\0");
  const [resolved, setResolved] = useState<Record<string, string>>(() =>
    Object.fromEntries(urls.map((u) => [u, u])),
  );
  const [loading, setLoading] = useState(() => urls.some(isBucketUrl));

  useEffect(() => {
    if (!urls.length) return;
    setLoading(true);
    void resolveSignedUrls(urls).then((result) => {
      setResolved(result);
      setLoading(false);
    });
  }, [key]);

  return { urls: resolved, loading };
};
