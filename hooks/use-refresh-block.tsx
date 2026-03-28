/**
 * @ Author: BetterInternship
 * @ Create Time: 2026-03-28 18:56:57
 * @ Modified time: 2026-03-28 18:59:35
 * @ Description:
 *
 * Creds to anaj00 for the idea.
 * Can be used to block a page refresh if a process is still happening.
 */

import { useEffect } from "react";

export const useBlockPageRefreshEffect = (enabled?: boolean) => {
  return useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
};
