"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "./input";
import { useDetectClickOutside } from "react-detect-click-outside";
import { cn } from "@/lib/utils";

export interface IAutocompleteOption<ID extends number | string> {
  id: ID;
  name: string;
}

/* -------------------------------------------------------
 * Base component (array-based). Single uses length 0..1.
 * -----------------------------------------------------*/
function AutocompleteBase<ID extends number | string>({
  options,
  value = [],
  setter,
  placeholder,
  className,
  multiple = true,
}: {
  options: IAutocompleteOption<ID>[];
  value?: ID[]; // single => 0..1 items, multi => any length
  setter: (next: ID[]) => void; // set the whole selection
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedSet = useMemo(() => new Set(value ?? []), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? options.filter((o) => o.name?.toLowerCase().includes(q))
      : options;
    return base.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [query, options]);

  const toggle = (id: ID) => {
    if (!multiple) {
      setter([id]); // single-select
      setIsOpen(false);
      setQuery("");
      return;
    }
    const set = new Set(value ?? []);
    set.has(id) ? set.delete(id) : set.add(id);
    setter(Array.from(set));
  };

  const removeAt = (id: ID) => {
    const set = new Set(value ?? []);
    set.delete(id);
    setter(Array.from(set));
  };

  const selectedLabels = useMemo(
    () =>
      (value ?? [])
        .map((id) => options.find((o) => o.id === id)?.name)
        .filter(Boolean) as string[],
    [value, options]
  );

  const singleDisplay = !multiple && (selectedLabels[0] ?? "");

  // --- keyboard helpers for multi
  const onMultiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!multiple) return;
    if (
      e.key === "Backspace" &&
      query.length === 0 &&
      (value?.length ?? 0) > 0
    ) {
      // remove last chip
      const last = value![value!.length - 1];
      removeAt(last);
      e.preventDefault();
    }
    if (e.key === "Enter") {
      const first = filtered[0];
      if (first) {
        toggle(first.id);
        setQuery("");
        setIsOpen(true);
        e.preventDefault();
      }
    }
    if (e.key === "ArrowDown") setIsOpen(true);
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      {multiple ? (
        // ---------- MULTI: chips inline inside the box ----------
        <div
          className={cn(
            "min-h-9 w-full rounded-[0.33em] border border-gray-300 bg-white",
            "px-2 py-1 flex flex-wrap items-center gap-1",
            "focus-within:border-primary focus-within:border-opacity-50"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {(value ?? []).map((id) => {
            const label = options.find((o) => o.id === id)?.name ?? String(id);
            return (
              <span
                key={String(id)}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 border border-gray-300 flex items-center gap-1"
              >
                {label}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700 leading-none"
                  onClick={() => removeAt(id)}
                  aria-label={`Remove ${label}`}
                >
                  ×
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={onMultiKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={(value?.length ?? 0) === 0 ? placeholder : ""}
            className={cn(
              "flex-1 min-w-[8ch] h-7 text-sm",
              "bg-transparent outline-none border-none focus:ring-0"
            )}
          />
        </div>
      ) : (
        // ---------- SINGLE: regular input ----------
        <Input
          value={singleDisplay || query}
          className="border-gray-300"
          placeholder={placeholder}
          onChange={(e) => {
            // typing starts a new search; selection is set on option click
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
        />
      )}

      {isOpen && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-[0.33em] bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
          {filtered.length ? (
            filtered.map((option) => {
              const active = selectedSet.has(option.id);
              return (
                <li
                  key={String(option.id)}
                  onClick={() => {
                    toggle(option.id);
                    if (multiple) {
                      // keep open for rapid multi-pick
                      setQuery("");
                      inputRef.current?.focus();
                    } else {
                      setQuery("");
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors flex items-center gap-2 cursor-pointer hover:bg-gray-100",
                    active && "bg-blue-50"
                  )}
                >
                  {multiple ? (
                    <input
                      type="checkbox"
                      readOnly
                      checked={active}
                      className="mr-2"
                    />
                  ) : null}
                  {option.name}
                </li>
              );
            })
          ) : (
            <li className="w-full text-left px-4 py-2 text-sm text-gray-700">
              No matching results.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------
 * Public API: single-select (same signature you had)
 * -----------------------------------------------------*/
export const Autocomplete = <ID extends number | string>({
  options,
  setter,
  placeholder,
  className,
  value,
}: {
  options: IAutocompleteOption<ID>[];
  setter: (value?: ID | null) => void;
  placeholder?: string;
  className?: string;
  value?: ID | null;
}) => {
  return (
    <AutocompleteBase<ID>
      options={options}
      multiple={false}
      value={value != null ? [value] : []}
      setter={(arr) => setter(arr[0] ?? null)}
      placeholder={placeholder}
      className={className}
    />
  );
};

/* -------------------------------------------------------
 * Public API: multi-select (uuid[] etc.)
 * -----------------------------------------------------*/
export const AutocompleteMulti = <ID extends number | string>({
  options,
  setter,
  placeholder,
  className,
  value,
}: {
  options: IAutocompleteOption<ID>[];
  setter: (value: ID[]) => void;
  placeholder?: string;
  className?: string;
  value?: ID[];
}) => {
  return (
    <AutocompleteBase<ID>
      options={options}
      multiple
      value={value ?? []}
      setter={setter}
      placeholder={placeholder}
      className={className}
    />
  );
};
