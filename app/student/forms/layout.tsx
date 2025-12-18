import { MyFormsContextProvider } from "./myforms.ctx";

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return <MyFormsContextProvider>{children}</MyFormsContextProvider>;
};

export default FormsLayout;
