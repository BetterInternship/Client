"use client";

import { MQJobsProvider } from "@betterinternship/components";
import { pollMqJob } from "@/lib/api/services";

/**
 * `MQJobsProvider`'s `poll` prop is a function, which can't cross the
 * Server->Client props boundary (RSC serialization). Both root layouts that
 * mount it are async Server Components, so the function has to be supplied
 * from inside a Client Component instead of passed down from them directly.
 */
export const AppMQJobsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => <MQJobsProvider poll={pollMqJob}>{children}</MQJobsProvider>;
