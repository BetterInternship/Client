/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 13:40:54
 * @ Modified time: 2025-06-22 14:40:01
 * @ Description:
 *
 * Gives us utils to check if company has moa.
 */

"use client";

import { createContext, useContext } from "react";
import { createMoaContext } from "./use-moa-backend";

// The IMoa context should only be loaded once
interface IMoa {
  check: (employer_id: string, university_id: string) => boolean;
}

const moaContext = createContext<IMoa>({} as IMoa);

/**
 * Gives our component access to moa info.
 *
 * @context
 */
export const MoaContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const moa_context = createMoaContext();

  return (
    <moaContext.Provider value={moa_context}>{children}</moaContext.Provider>
  );
};

export const useDbMoa = () => useContext(moaContext);
