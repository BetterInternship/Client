"use client";

import React, { createContext, useContext, useState } from "react";

interface HeaderContextType {
  mobileHeaderAddon: React.ReactNode | null;
  setMobileHeaderAddon: (content: React.ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error(
      "useHeaderContext must be used within HeaderContextProvider",
    );
  }
  return context;
};

export const HeaderContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mobileHeaderAddon, setMobileHeaderAddon] =
    useState<React.ReactNode | null>(null);

  return (
    <HeaderContext.Provider
      value={{
        mobileHeaderAddon,
        setMobileHeaderAddon,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
