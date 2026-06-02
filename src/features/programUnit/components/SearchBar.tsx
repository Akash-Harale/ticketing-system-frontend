import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search program units…',
  id = 'search-bar',
}: SearchBarProps) => {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm ring-1 ring-transparent transition-all duration-200 focus-within:border-indigo-400 focus-within:ring-indigo-100">
      <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
      />
      {value && (
        <button
          id={`${id}-clear`}
          onClick={() => onChange('')}
          className="rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
