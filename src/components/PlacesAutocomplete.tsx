"use client";

import { useState, useEffect, useRef } from "react";

interface Suggestion {
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  id,
  "aria-label": ariaLabel,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(value.trim())}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(s: Suggestion) {
    onChange(s.mainText || s.description);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          className={className}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.description}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-4 py-2.5 cursor-pointer flex flex-col gap-0.5 ${i === activeIndex ? "bg-gray-50" : "hover:bg-gray-50"}`}
            >
              <span className="text-sm text-gray-800 font-medium">{s.mainText || s.description}</span>
              {s.secondaryText && (
                <span className="text-xs text-gray-400">{s.secondaryText}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
