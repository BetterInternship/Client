// components/providers/ModalProvider.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalOptions = {
  allowBackdropClick?: boolean; // default: true
  closeOnEsc?: boolean; // default: true
  hasClose?: boolean;
  onClose?: () => void; // called AFTER the modal is removed
  backdropClassName?: string;
  panelClassName?: string;
};

type RegistryEntry = { node: React.ReactNode; opts: ModalOptions };

type Open = (
  name: string,
  content: React.ReactNode,
  opts?: ModalOptions
) => void;
type Close = (name?: string) => void;

const ModalCtx = createContext<{ open: Open; close: Close }>({
  open: () => {},
  close: () => {},
});

export const useGlobalModal = () => useContext(ModalCtx);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, RegistryEntry>>({});

  const open = useCallback<Open>((name, content, opts = {}) => {
    setRegistry((m) => ({ ...m, [name]: { node: content, opts } }));
  }, []);

  const close = useCallback<Close>((name) => {
    setRegistry((m) => {
      if (!name) {
        // close all (call onClose for each)
        Object.values(m).forEach((e) => e.opts.onClose?.());
        return {};
      }
      const entry = m[name];
      entry?.opts.onClose?.();
      const { [name]: _removed, ...rest } = m;
      return rest;
    });
  }, []);

  // ESC to close the top-most modal that allows it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const entries = Object.entries(registry);
      if (!entries.length) return;
      const [lastName, lastEntry] = entries[entries.length - 1];
      if (lastEntry.opts.closeOnEsc !== false) close(lastName);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [registry, close]);

  const portals = useMemo(
    () =>
      Object.entries(registry).map(([name, { node, opts }]) =>
        createPortal(
          <div
            key={name}
            className={
              `fixed inset-0 z-[1000] bg-black/10 backdrop-blur-sm flex items-center justify-center ` +
              (opts.backdropClassName ?? "")
            }
            onClick={() => {
              if (opts.allowBackdropClick === false) return;
              close(name);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={
                `mx-auto w-fit max-w-3xl max-h-[95vh] rounded-md border bg-white shadow-xl relative pt-6 overflow-auto` +
                (opts.panelClassName ?? "")
              }
              onClick={(e) => e.stopPropagation()}
            >
              {opts.hasClose !== false && (
                <button
                  aria-label="Close"
                  onClick={() => close(name)}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
              <div className="p-5">{node}</div>
            </div>
          </div>,
          document.body
        )
      ),
    [registry, close]
  );

  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}
      {portals}
    </ModalCtx.Provider>
  );
}
