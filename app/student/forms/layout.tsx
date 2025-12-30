"use client";

import { MyFormsContextProvider } from "./myforms.ctx";
import { FormRendererContextProvider } from "@/components/features/student/forms/form-renderer.ctx";
import { FormFillerContextProvider } from "@/components/features/student/forms/form-filler.ctx";

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MyFormsContextProvider>
      <FormRendererContextProvider>
        <FormFillerContextProvider>
          <div className="h-full overflow-auto">{children}</div>
        </FormFillerContextProvider>
      </FormRendererContextProvider>
    </MyFormsContextProvider>
  );
};

export default FormsLayout;
