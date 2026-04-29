/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 13:40:54
 * @ Modified time: 2026-04-19 00:10:33
 * @ Description:
 *
 * Gives us utils to check if company has moa.
 */

"use client";

import { createContext, useContext } from "react";
import { Moa } from "./db.types";

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
  moa,
  children,
}: {
  moa?: Moa[];
  children: React.ReactNode;
}) => {
  const biMoaContextValue = createBiMoaContext(moa ?? []);

  return (
    <biMoaContext.Provider value={biMoaContextValue}>
      {children}
    </biMoaContext.Provider>
  );
};

export const useDbMoa = () => useContext(biMoaContext);

const createBiMoaContext = (moa: Moa[]): IBIMoa => {
  return {
    check: (employer_id: string, university_id: string) =>
      moa.some(
        (m) =>
          m.employer_id === employer_id &&
          m.university_id === university_id &&
          new Date(m.expires_at ?? "").getTime() > new Date().getTime(),
      ),
  };
};
