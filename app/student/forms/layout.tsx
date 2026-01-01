"use client";

import { useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MyFormsContextProvider } from "./myforms.ctx";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { FormFillerContextProvider } from "@/components/features/student/forms/form-filler.ctx";
import { FormsNavigation } from "@/components/features/student/forms/FormsNavigation";
import { useMyForms } from "./myforms.ctx";

interface FormsLayoutContextType {
  activeView: "generate" | "history";
  setActiveView: (view: "generate" | "history") => void;
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
  const [activeView, setActiveView] = useState<"generate" | "history">(
    "generate",
  );
  const myForms = useMyForms();

  const handleViewChange = (view: "generate" | "history") => {
    setActiveView(view);
    // If we're on a detail page, navigate back to /forms
    if (pathname !== "/forms") {
      router.push("/forms");
    }
  };

  return (
    <FormsLayoutContext.Provider value={{ activeView, setActiveView }}>
      <div suppressHydrationWarning className="h-full flex flex-col">
        <FormsNavigation
          activeView={activeView}
          onViewChange={handleViewChange}
          hasHistory={myForms?.forms?.length > 0}
        />
        <div className="h-full overflow-auto">{children}</div>
      </div>
    </FormsLayoutContext.Provider>
  );
}

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div suppressHydrationWarning>
      <MyFormsContextProvider>
        <FormRendererContextProvider>
          <FormFillerContextProvider>
            <FormsLayoutContent>{children}</FormsLayoutContent>
          </FormFillerContextProvider>
        </FormRendererContextProvider>
      </MyFormsContextProvider>
    </div>
  );
};

export default FormsLayout;
