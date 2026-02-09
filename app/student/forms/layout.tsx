"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { MyFormsContextProvider } from "./myforms.ctx";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { FormFillerContextProvider } from "@/components/features/student/forms/form-filler.ctx";
import { FormsNavigation } from "@/components/features/student/forms/FormsNavigation";
import { useMyForms } from "./myforms.ctx";
import { SignContextProvider } from "@/components/providers/sign.ctx";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useHeaderContext, MobileAddonConfig } from "@/lib/ctx-header";

interface FormsLayoutContextType {
  activeView: "generate" | "history";
  setActiveView: (view: "generate" | "history") => void;
  currentFormName: string | null;
  setCurrentFormName: (name: string | null) => void;
  currentFormLabel: string | null;
  setCurrentFormLabel: (label: string | null) => void;
}

const FormsLayoutContext = createContext<FormsLayoutContextType | undefined>(
  undefined,
);

export const useFormsLayout = () => {
  const context = useContext(FormsLayoutContext);
  if (!context) {
    throw new Error("useFormsLayout must be used within FormsLayout");
  }
  return context;
};

function FormsLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMobile();
  const { setMobileAddonConfig } = useHeaderContext();
  const myForms = useMyForms();
  const [manualActiveView, setManualActiveView] = useState<
    "generate" | "history" | null
  >(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentFormName, setCurrentFormName] = useState<string | null>(null);
  const [currentFormLabel, setCurrentFormLabel] = useState<string | null>(null);

  const hasFormsToShow = (myForms?.forms?.length ?? 0) > 0;

  // Determine the active view: use manual selection if user clicked nav, otherwise derive from forms
  const activeView = useMemo(() => {
    if (manualActiveView !== null) {
      return manualActiveView;
    }
    // Default: show history if there are forms, otherwise show generate
    return hasFormsToShow ? "history" : "generate";
  }, [manualActiveView, hasFormsToShow]);

  // Check for view query parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "history" || viewParam === "generate") {
        setManualActiveView(viewParam);
        // Clean up URL after reading param
        window.history.replaceState({}, "", pathname);
      }
      // Mark as initialized regardless of whether we found a param
      setIsInitialized(true);
    }
  }, [pathname]);

  const handleViewChange = useCallback(
    (view: "generate" | "history") => {
      setManualActiveView(view);
      // If we're on a detail page, navigate back to /forms
      if (pathname !== "/forms") {
        router.push("/forms");
      }
    },
    [pathname, router],
  );

  // Compute mobile addon config directly based on current state
  const mobileAddonConfig: MobileAddonConfig = useMemo(() => {
    if (!isMobile || !isInitialized) {
      return { show: false };
    }
    return {
      show: true,
      activeView,
      onViewChange: handleViewChange,
      currentFormName,
      currentFormLabel,
    };
  }, [
    isMobile,
    isInitialized,
    activeView,
    handleViewChange,
    currentFormName,
    currentFormLabel,
  ]);

  // Sync config to context after render
  useLayoutEffect(() => {
    setMobileAddonConfig(mobileAddonConfig);
  }, [
    mobileAddonConfig.show,
    mobileAddonConfig.activeView,
    mobileAddonConfig.currentFormName,
    mobileAddonConfig.currentFormLabel,
  ]);

  return (
    <FormsLayoutContext.Provider
      value={{
        activeView,
        setActiveView: setManualActiveView,
        currentFormName,
        setCurrentFormName,
        currentFormLabel,
        setCurrentFormLabel,
      }}
    >
      <div
        suppressHydrationWarning
        className="h-full flex flex-col overflow-hidden"
      >
        <div className="hidden sm:block">
          <FormsNavigation
            activeView={activeView}
            onViewChange={handleViewChange}
            currentFormName={currentFormName}
            currentFormLabel={currentFormLabel}
            variant="bar"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {!isInitialized ? <div /> : children}
        </div>
      </div>
    </FormsLayoutContext.Provider>
  );
}

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      suppressHydrationWarning
      className="h-screen flex flex-col overflow-hidden"
    >
      <MyFormsContextProvider>
        <FormRendererContextProvider>
          <FormFillerContextProvider>
            <SignContextProvider>
              <FormsLayoutContent>{children}</FormsLayoutContent>
              <SonnerToaster />
            </SignContextProvider>
          </FormFillerContextProvider>
        </FormRendererContextProvider>
      </MyFormsContextProvider>
    </div>
  );
};

export default FormsLayout;
