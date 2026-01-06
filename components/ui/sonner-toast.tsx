import { Toaster } from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface ToastOptions {
  center?: boolean;
  fitContent?: boolean;
}

const createToastPreset = (
  icon: React.ReactNode,
  background: string,
  options: ToastOptions = {}
) => {
  const { center = true, fitContent = false } = options;
  return {
    icon,
    style: {
      background,
      color: "#ffffff",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...(fitContent && { width: "fit-content" }),
    },
  };
};

export const toastPresets = {
  success: createToastPreset(<CheckCircle className="h-5 w-5" />, "#059669"),
  destructive: createToastPreset(<AlertCircle className="h-5 w-5" />, "#dc2626"),
  alert: createToastPreset(<AlertTriangle className="h-5 w-5" />, "#d97706"),
};

export function createCustomToastPreset(
  background: string,
  icon: React.ReactNode,
  options?: ToastOptions
) {
  return createToastPreset(icon, background, options);
}

export function SonnerToaster() {
  return (
    <>
      <style>{`
        /* Toast container */
        [data-sonner-toast] {
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Icon styling */
        [data-sonner-toast] svg {
          display: inline-block;
          margin-right: 8px;
        }
      `}</style>
      <Toaster position="top-center" richColors />
    </>
  );
}
