import { createContext, useContext } from "react";

interface IFormPreviewerContext {
  fields: [];
  previews: [];
}

// Context defs
const FormPreviewerContext = createContext<IFormPreviewerContext>(
  {} as IFormPreviewerContext,
);
export const useFormPreviewerContext = () => useContext(FormPreviewerContext);
