"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      staleTime: 24 * 60 * 60 * 1000,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : AsyncStorage,
});

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          // Marketplace listing pages are always-fresh (staleTime 0,
          // refetchOnMount "always") — persisting them defeats that and can
          // show hours-old listings before the refetch lands.
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] !== "job-listings" &&
            defaultShouldDehydrateQuery(query),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
