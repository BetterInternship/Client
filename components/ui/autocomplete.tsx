"use client";

import { useState, useEffect, useMemo, useRef, useId } from "react";
import { Input } from "./input";
import { useDetectClickOutside } from "react-detect-click-outside";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { PlusCircle, PlusCircleIcon } from "lucide-react";

export interface IAutocompleteOption<ID extends number | string> {
  id: ID;
  name: string;
}

/* -------------------------------------------------------
 * Base component (array-based). Single uses length 0..1.
 * -----------------------------------------------------*/
function AutocompleteBase<ID extends number | string>({
  required,
  options,
  value = [],
  setter,
  placeholder,
  className,
  multiple = true,
  label,
  ...props
}: {
  required?: boolean;
  options: IAutocompleteOption<ID>[];
  value?: ID[]; // single => 0..1 items, multi => any length
  setter: (next: ID[]) => void; // set the whole selection
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  label?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const inputId = useId();

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
      {label ? (
        <label htmlFor={inputId} className="text-xs text-gray-600 mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      ) : null}

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
                className="px-2 py-1 text-xs rounded-sm bg-gray-100 border border-gray-300 flex items-center gap-1"
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
            id={inputId}
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
            {...props}
          />
        </div>
      ) : (
        // ---------- SINGLE: regular input ----------
        <Input
          id={inputId}
          value={singleDisplay || query}
          className="border-gray-200"
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
 * Public API: single-select (same signature + label)
 * -----------------------------------------------------*/
export const Autocomplete = <ID extends number | string>({
  required,
  options,
  setter,
  placeholder,
  className,
  value,
  label,
  props,
}: {
  required?: boolean;
  options: IAutocompleteOption<ID>[];
  setter: (value?: ID | null) => void;
  placeholder?: string;
  className?: string;
  value?: ID | null;
  label?: React.ReactNode;
  props?: any[];
}) => {
  return (
    <AutocompleteBase<ID>
      required={required}
      options={options}
      multiple={false}
      value={value != null ? [value] : []}
      setter={(arr) => setter(arr[0] ?? null)}
      placeholder={placeholder}
      className={className}
      label={label}
      {...props}
    />
  );
};

/* -------------------------------------------------------
 * Public API: multi-select (uuid[] etc.) + label
 * -----------------------------------------------------*/
export const AutocompleteMulti = <ID extends number | string>({
  required,
  options,
  setter,
  placeholder,
  className,
  value,
  label,
}: {
  required?: boolean;
  options: IAutocompleteOption<ID>[];
  setter: (value: ID[]) => void;
  placeholder?: string;
  className?: string;
  value?: ID[];
  label?: React.ReactNode;
}) => {
  return (
    <AutocompleteBase<ID>
      required={required}
      options={options}
      multiple
      value={value ?? []}
      setter={setter}
      placeholder={placeholder}
      className={className}
      label={label}
    />
  );
};

/* -------------------------------------------------------
 * Public API: grouped multi-select with tree + label
 * -----------------------------------------------------*/
export type SubOption = { name: string; value: string };
export type PositionCategory = {
  name: string;
  value: string;
  children?: SubOption[];
};

export function AutocompleteTreeMulti({
  required,
  tree,
  value = [],
  setter,
  placeholder,
  className,
  label,
}: {
  required?: boolean;
  tree: PositionCategory[];
  value?: string[];
  setter: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const inputRef = useRef<HTMLButtonElement | null>(null);
  const inputId = useId();

  // Build ID -> label map (child shows "Parent · Child")
  const labelMap = useMemo(() => {
    const m = new Map<string, string>();
    tree.forEach((p) => {
      if (!p.children?.length) {
        m.set(p.value, p.name); // standalone parent
      } else {
        p.children.forEach((c) => m.set(c.value, `${p.name} · ${c.name}`));
      }
    });
    return m;
  }, [tree]);

  // Valid id set (standalone parents + children)
  const validIds = useMemo(() => {
    const s = new Set<string>();
    tree.forEach((p) => {
      if (!p.children?.length) s.add(p.value);
      p.children?.forEach((c) => s.add(c.value));
    });
    return s;
  }, [tree]);

  // sanitize external value
  const selected = useMemo(
    () => Array.from(new Set((value ?? []).filter((v) => validIds.has(v)))),
    [value, validIds]
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Helpers
  const setSelected = (arr: string[]) => setter(Array.from(new Set(arr)));
  const toggleChild = (cid: string) => {
    const next = new Set(selected);
    next.has(cid) ? next.delete(cid) : next.add(cid);
    setSelected(Array.from(next));
  };
  const toggleParent = (p: PositionCategory) => {
    if (!p.children?.length) {
      const next = new Set(selected);
      next.has(p.value) ? next.delete(p.value) : next.add(p.value);
      setSelected(Array.from(next));
      return;
    }
    const childIds = p.children.map((c) => c.value);
    const allSelected = childIds.every((id) => selectedSet.has(id));
    const next = new Set(selected);
    if (allSelected) childIds.forEach((id) => next.delete(id));
    else childIds.forEach((id) => next.add(id));
    setSelected(Array.from(next));
  };
  const removeAt = (id: string) =>
    setSelected(selected.filter((x) => x !== id));

  // query filter (keeps parents with any matching child)
  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    return tree
      .map((p) => {
        const parentMatch = p.name.toLowerCase().includes(q);
        const kids = p.children?.filter((c) =>
          `${p.name} ${c.name}`.toLowerCase().includes(q)
        );
        if (!p.children?.length) {
          // standalone parent
          return parentMatch ? p : null;
        }
        if (parentMatch) return p; // keep entire group
        if (kids && kids.length > 0) return { ...p, children: kids };
        return null;
      })
      .filter(Boolean) as PositionCategory[];
  }, [tree, query]);

  // counts for indeterminate
  const counts = useMemo(() => {
    const m = new Map<string, { total: number; sel: number }>();
    tree.forEach((p) => {
      const hasKids = !!p.children?.length;
      if (!hasKids) {
        m.set(p.value, { total: 1, sel: selectedSet.has(p.value) ? 1 : 0 });
      } else {
        const ids = p.children!.map((c) => c.value);
        const sel = ids.reduce((a, id) => a + (selectedSet.has(id) ? 1 : 0), 0);
        m.set(p.value, { total: ids.length, sel });
      }
    });
    return m;
  }, [tree, selectedSet]);

  // chips
  const chips = useMemo(
    () =>
      selected
        .map((id) => [id, labelMap.get(id) ?? id] as const)
        .sort((a, b) => a[1].localeCompare(b[1])),
    [selected, labelMap]
  );

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      {label ? (
        <label htmlFor={inputId} className="text-xs text-gray-600 mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      ) : null}

      {/* input + chips (same look/feel as AutocompleteMulti) */}
      <div
        className={cn(
          "min-h-9 w-full rounded-[0.33em] border border-gray-300 bg-white ",
          "py-1 flex flex-wrap items-center gap-1 hover:bg-gray-50 hover:cursor-pointer",
          "focus-within:border-primary focus-within:border-opacity-50 transition-all"
        )}
        onClick={(e) => setIsOpen(true)}
      >
        {chips.map(([id, label]) => (
          <span
            key={id}
            className="ml-2 mt-[0.25em] px-2 py-1 text-xs rounded-full bg-gray-100 border border-gray-300 flex items-center gap-1"
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
        ))}
        {selected.length === 0 && (
          <div className="w-full flex flex-row items-center justify-between text-sm text-primary/75 px-3">
            {placeholder && "Select one or more"}
            <PlusCircleIcon className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-40 overflow-auto rounded-[0.33em] bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
          {filteredTree.length ? (
            filteredTree.map((p) => {
              const info = counts.get(p.value)!;
              const hasKids = !!p.children?.length;
              const all = hasKids && info.sel === info.total;
              const some = hasKids && info.sel > 0 && info.sel < info.total;
              const parentChecked = !hasKids && info.sel === 1;

              return (
                <li key={p.value} className="w-full">
                  {/* Parent row */}
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100"
                    )}
                    onClick={() => toggleParent(p)}
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4">
                      <input
                        type="checkbox"
                        readOnly
                        checked={all || parentChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = Boolean(some);
                        }}
                        className="align-middle"
                      />
                    </span>
                    <span className="font-medium">{p.name}</span>
                    {hasKids && (
                      <span className="ml-auto text-xs text-gray-500">
                        {info.sel}/{info.total}
                      </span>
                    )}
                  </button>

                  {/* Children */}
                  {hasKids && (
                    <ul className="pl-8">
                      {p.children!.map((c) => {
                        const active = selectedSet.has(c.value);
                        return (
                          <li key={c.value}>
                            <button
                              type="button"
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100"
                              )}
                              onClick={() => {
                                toggleChild(c.value);
                                setIsOpen(true);
                                setQuery("");
                                inputRef.current?.focus();
                              }}
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={active}
                              />
                              {c.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
