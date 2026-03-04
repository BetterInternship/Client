"use client";

import { MyFormsContextProvider } from "./myforms.ctx";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { FormFillerContextProvider } from "@/components/features/student/forms/form-filler.ctx";
import { SignContextProvider } from "@/components/providers/sign.ctx";

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      suppressHydrationWarning
      className="h-screen flex flex-col overflow-hidden"
    >
      <MyFormsContextProvider>
        <FormRendererContextProvider>
          <FormFillerContextProvider>
            <SignContextProvider>{children}</SignContextProvider>
          </FormFillerContextProvider>
        </FormRendererContextProvider>
      </MyFormsContextProvider>
    </div>
  );
};

export default FormsLayout;
