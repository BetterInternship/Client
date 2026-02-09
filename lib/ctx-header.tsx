"use client";

import React, { createContext, useContext, useState } from "react";

export interface MobileAddonConfig {
  show: boolean;
  activeView?: "generate" | "history";
  onViewChange?: (view: "generate" | "history") => void;
  currentFormName?: string | null;
  currentFormLabel?: string | null;
}

interface HeaderContextType {
  mobileAddonConfig: MobileAddonConfig;
  setMobileAddonConfig: (config: MobileAddonConfig) => void;
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
  const [mobileAddonConfig, setMobileAddonConfig] = useState<MobileAddonConfig>(
    { show: false },
  );

  return (
    <HeaderContext.Provider
      value={{
        mobileAddonConfig,
        setMobileAddonConfig,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
