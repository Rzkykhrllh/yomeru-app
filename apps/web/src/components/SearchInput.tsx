"use client";

import { useState, useEffect, forwardRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = "Search...", onClear }, ref) => {
    const [internalValue, setInternalValue] = useState(value);

    // Debounce: update parent after 300ms of no typing
    useEffect(() => {
      const timer = setTimeout(() => {
        onChange(internalValue);
      }, 300);

      return () => clearTimeout(timer);
    }, [internalValue, onChange]);

    // Sync external value changes
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleClear = () => {
      setInternalValue("");
      onChange("");
      onClear?.();
    };

    return (
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-line bg-card text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
        {internalValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
            title="Clear search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
