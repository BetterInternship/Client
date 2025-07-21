import { useState, useEffect } from "react";
import { Input } from "./input";
import { useDetectClickOutside } from "react-detect-click-outside";

export const Autocomplete = ({
  options,
  setter,
  placeholder,
  value = "",
}: {
  options: string[];
  setter: (value: string) => void;
  placeholder?: string;
  value?: string;
}) => {
  const [query, set_query] = useState("");
  const [is_open, set_is_open] = useState(false);
  const [selected, set_selected] = useState<string | null>(null);
  const ref = useDetectClickOutside({ onTriggered: () => set_is_open(false) });

  useEffect(() => {
    set_selected(value || null);
    set_query("");
  }, [value]);

  const filtered_options = query
    ? options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  return (
    <div className="relative w-full" ref={ref}>
      <Input
        value={selected ?? query}
        className="border-gray-300"
        placeholder={placeholder}
        onChange={(e) => {
          setter(e.target.value);
          set_query(e.target.value);
          set_selected(null);
          set_is_open(true);
        }}
        onFocus={() => set_is_open(true)}
      />
      {is_open && !selected && query.length ? (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
          {filtered_options.length ? (
            filtered_options.map((option, index) => (
              <li
                key={index}
                onClick={() => {
                  set_selected(option);
                  setter(option);
                  set_query("");
                  set_is_open(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {option}
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
