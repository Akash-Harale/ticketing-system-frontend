import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, CheckSquare, Square } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  id?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  maxTagsShown?: number;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectDropdown = ({
  id = 'multi-select',
  options,
  selected,
  onChange,
  placeholder = 'Select options…',
  searchPlaceholder = 'Search…',
  label,
  maxTagsShown = 2,
  disabled = false,
  className = '',
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Focus search when opened */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  const isSelected = (val: string) => selected.includes(val);
  const allFiltered = filtered.every((o) => selected.includes(o.value));
  const someFiltered = filtered.some((o) => selected.includes(o.value));

  const toggle = (val: string) => {
    onChange(isSelected(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  };

  const toggleAllFiltered = () => {
    if (allFiltered) {
      // deselect all currently filtered
      onChange(selected.filter((s) => !filtered.find((o) => o.value === s)));
    } else {
      // select all filtered (merge, no duplicates)
      const toAdd = filtered.map((o) => o.value).filter((v) => !selected.includes(v));
      onChange([...selected, ...toAdd]);
    }
  };

  const removeTag = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== val));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  /* What to show in the trigger */
  const renderTrigger = () => {
    if (selected.length === 0) {
      return <span className="text-sm text-gray-400">{placeholder}</span>;
    }
    const visibleTags = selected.slice(0, maxTagsShown);
    const overflow = selected.length - maxTagsShown;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleTags.map((val) => {
          const label = options.find((o) => o.value === val)?.label ?? val;
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-100 py-0.5 pr-1 pl-2 text-[12px] font-medium text-indigo-700"
            >
              {label}
              <button
                type="button"
                id={`tag-remove-${val.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => removeTag(val, e)}
                className="rounded-full p-0.5 transition hover:bg-indigo-200"
                aria-label={`Remove ${label}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          );
        })}
        {overflow > 0 && (
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[12px] font-semibold text-gray-500">
            +{overflow} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* ── Trigger ── */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex min-h-[44px] w-full items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed border-gray-100 bg-gray-50'
            : open
              ? 'border-indigo-400 bg-white shadow-sm ring-2 ring-indigo-100'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">{renderTrigger()}</div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {selected.length > 0 && (
            <button
              type="button"
              id={`${id}-clear`}
              onClick={clearAll}
              className="rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[240px] rounded-xl border border-gray-200 bg-white shadow-xl"
          role="listbox"
          aria-multiselectable="true"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 transition hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Select All (for filtered set) */}
          {filtered.length > 0 && (
            <button
              type="button"
              id={`${id}-select-all`}
              onClick={toggleAllFiltered}
              className="flex w-full items-center gap-3 border-b border-gray-100 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <span className="flex-shrink-0 text-indigo-500">
                {allFiltered ? (
                  <CheckSquare className="h-4 w-4" />
                ) : someFiltered ? (
                  <CheckSquare className="h-4 w-4 opacity-50" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </span>
              {allFiltered ? 'Deselect All' : 'Select All'}
              {query && (
                <span className="ml-auto text-[11px] font-normal text-gray-400">
                  {filtered.length} matches
                </span>
              )}
            </button>
          )}

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                No options match "{query}"
              </p>
            ) : (
              filtered.map((option) => {
                const selected_ = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    id={`${id}-opt-${option.value.toLowerCase().replace(/\s+/g, '-')}`}
                    role="option"
                    aria-selected={selected_}
                    onClick={() => toggle(option.value)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2 text-sm transition-colors ${
                      selected_
                        ? 'bg-indigo-50 font-medium text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        selected_
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-gray-300 group-hover:border-indigo-300'
                      }`}
                    >
                      {selected_ && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="flex-1 truncate text-left">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-3.5 py-2">
              <span className="text-[12px] text-gray-500">{selected.length} selected</span>
              <button
                type="button"
                id={`${id}-clear-footer`}
                onClick={() => onChange([])}
                className="text-[12px] font-medium text-red-500 transition hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
