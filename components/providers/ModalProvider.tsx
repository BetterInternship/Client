"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Open = (name: string, content: React.ReactNode) => void;
type Close = (name?: string) => void;

const ModalCtx = createContext<{ open: Open; close: Close }>({
  open: () => {},
  close: () => {},
});

export const useGlobalModal = () => useContext(ModalCtx);

/** Renders modals via a tiny global registry + React Portal */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, React.ReactNode>>({});

  const open = useCallback<Open>((name, content) => {
    setRegistry((m) => ({ ...m, [name]: content }));
  }, []);

  const close = useCallback<Close>((name) => {
    setRegistry((m) => {
      if (!name) return {}; // close all
      const { [name]: _removed, ...rest } = m;
      return rest;
    });
  }, []);

  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}

      {Object.entries(registry).map(([name, node]) =>
        createPortal(
          <div
            key={name}
            className="fixed inset-0 z-[1000] bg-black/10 backdrop-blur-sm flex items-center justify-center"
            onClick={() => close(name)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="mx-auto w-fit max-w-3xl rounded-md border bg-white shadow-xl relative pt-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close"
                onClick={() => close(name)}
                className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
              <div className="p-5">{node}</div>
            </div>
          </div>,
          document.body
        )
      )}
    </ModalCtx.Provider>
  );
}
