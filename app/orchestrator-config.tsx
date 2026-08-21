"use client";

import { useEffect } from "react";
import { configure } from "@betterinternship/components";

export function OrchestratorConfig() {
  useEffect(() => {
    configure({
      orchestratorApi: `${process.env.NEXT_PUBLIC_ORCA_URL?.replace(/\/$/, "")}/process`,
    });
  }, []);

  return null;
}
