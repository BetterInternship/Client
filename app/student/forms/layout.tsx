"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { MyFormsContextProvider } from "./myforms.ctx";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { FormFillerContextProvider } from "@/components/features/student/forms/form-filler.ctx";
import { useMyForms } from "./myforms.ctx";
import { SignContextProvider } from "@/components/providers/sign.ctx";
import { useMobile } from "@/hooks/use-mobile";
import { useHeaderContext, MobileAddonConfig } from "@/lib/ctx-header";

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
    };
  }, [isMobile, isInitialized, activeView, handleViewChange]);

  // Sync config to context after render
  useLayoutEffect(() => {
    setMobileAddonConfig(mobileAddonConfig);
  }, [
    mobileAddonConfig.show,
    mobileAddonConfig.activeView,
    mobileAddonConfig.currentFormName,
    mobileAddonConfig.currentFormLabel,
  ]);

  // Clear addon config when layout unmounts
  useLayoutEffect(() => {
    return () => {
      setMobileAddonConfig({ show: false });
    };
  }, [setMobileAddonConfig]);

  return children;
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
            </SignContextProvider>
          </FormFillerContextProvider>
        </FormRendererContextProvider>
      </MyFormsContextProvider>
    </div>
  );
};

export default FormsLayout;
