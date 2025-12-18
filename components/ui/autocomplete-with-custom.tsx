"use client";

import { useState, useMemo, useRef, useId, useEffect } from "react";
import { Input } from "./input";
import { useDetectClickOutside } from "react-detect-click-outside";
import { cn } from "@/lib/utils";

export interface IAutocompleteOption {
  name: string;
}

/**
 * Autocomplete component that allows custom text entry while showing suggestions.
 * Similar to LinkedIn's degree field - you can type freely but get suggestions once you start.
 */
export const AutocompleteWithCustom = ({
  required,
  options = [],
  value,
  setter,
  placeholder,
  className,
  label,
  maxSuggestions = 10,
}: {
  required?: boolean;
  options?: IAutocompleteOption[];
  value?: string;
  setter: (value?: string) => void;
  placeholder?: string;
  className?: string;
  label?: React.ReactNode;
  maxSuggestions?: number;
}) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  // Sync external value changes
  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  // Filter options based on input
  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return [];
    
    const matches = options.filter((o) => {
      const lowerName = o.name?.toLowerCase();
      return lowerName?.includes(q) && lowerName !== q; // Don't show exact match
    });
    
    return matches
      .slice(0, maxSuggestions)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inputValue, options, maxSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setter(newValue);
    
    // Only show dropdown if there are suggestions and user has typed something
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (optionName: string) => {
    setInputValue(optionName);
    setter(optionName);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      // Select first suggestion on Enter
      handleSelectOption(filtered[0].name);
      e.preventDefault();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    if (e.key === "ArrowDown" && filtered.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      {label ? (
        <label htmlFor={inputId} className="text-xs text-gray-600 mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      ) : null}

      <Input
        id={inputId}
        ref={inputRef}
        value={inputValue}
        className="border-gray-200"
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.trim().length > 0 && filtered.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-[0.33em] bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
          {filtered.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectOption(option.name)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors cursor-pointer hover:bg-gray-100",
              )}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
