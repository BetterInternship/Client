/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 13:40:54
 * @ Modified time: 2025-10-11 00:00:11
 * @ Description:
 *
 * Gives us utils to check if company has moa.
 */

"use client";

import { createContext, useContext } from "react";
import { createBiMoaContext } from "./use-bi-moa-backend";

// The IMoa context should only be loaded once
interface IBIMoa {
  check: (employer_id: string, university_id: string) => boolean;
}

const biMoaContext = createContext<IBIMoa>({} as IBIMoa);

/**
 * Gives our component access to moa info.
 *
 * @context
 */
export const BIMoaContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const biMoaContextValue = createBiMoaContext();

  return (
    <biMoaContext.Provider value={biMoaContextValue}>{children}</biMoaContext.Provider>
  );
};

export const useDbMoa = () => useContext(biMoaContext);
