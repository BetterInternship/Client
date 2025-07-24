import { useState, useEffect, useMemo } from "react";
import { Input } from "./input";
import { useDetectClickOutside } from "react-detect-click-outside";
import { cn } from "@/lib/utils";

interface IAutocompleteOption<ID extends number | string> {
  id: ID;
  name: string;
}

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
  const [query, setQuery] = useState("");
  const [is_open, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<IAutocompleteOption<ID> | null>(
    null
  );
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const [filteredOptions, setFilteredOptions] = useState<
    IAutocompleteOption<ID>[]
  >([]);

  useEffect(() => {
    setSelected(options.find((o) => o.id === value) || null);
  }, [value]);

  useEffect(() => {
    const match = options.find((o) => o.id === value);
    if (match) {
      setSelected(match);
      setIsOpen(false);
    }
  }, [options]);

  // Filter by query
  useEffect(() => {
    setFilteredOptions(
      query
        ? options.filter((option) =>
            option?.name?.toLowerCase()?.includes(query.toLowerCase())
          )
        : options
    );
  }, [query, options]);

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <Input
        value={selected?.name ?? undefined}
        className="border-gray-300"
        placeholder={placeholder}
        onChange={(e) => {
          setter(e.target.value as ID);
          setQuery(e.target.value);
          setSelected(null);
          setIsOpen(true);

          const match = options.find((o) => o.name === e.target.value);
          if (match) {
            setSelected(match);
            setter(match.id);
            setQuery("");
            setIsOpen(false);
          }
        }}
        onFocus={() => setIsOpen(true)}
      />
      {is_open && !selected ? (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-[0.33em] bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
          {filteredOptions.length ? (
            filteredOptions
              .toSorted((a, b) => a.name.localeCompare(b.name))
              .map((option, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelected(option);
                    setter(option.id);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {option.name}
                </li>
              ))
          ) : (
            <li
              key="no-match"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              No matching results.
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
};
