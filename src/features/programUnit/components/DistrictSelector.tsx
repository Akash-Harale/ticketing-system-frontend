import React from 'react';
import { X, MapPin, CheckSquare, Square, Check } from 'lucide-react';

interface DistrictSelectorProps {
  state: string;
  districts: string[];
  selectedDistricts: string[];
  onToggle: (district: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const DistrictSelector = ({
  state,
  districts,
  selectedDistricts,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}: DistrictSelectorProps) => {
  const allSelected = selectedDistricts.length === districts.length;

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-inner">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-indigo-500" />
          <p className="truncate text-[13px] font-semibold text-indigo-800">
            Select districts in <span className="text-indigo-600">{state}</span>
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Select All / Clear toggle */}
          <button
            id="district-toggle-all"
            type="button"
            onClick={allSelected ? onClearAll : onSelectAll}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            {allSelected ? (
              <CheckSquare className="h-3.5 w-3.5" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            {allSelected ? 'Clear All' : 'Select All'}
          </button>

          <button
            id="district-panel-close"
            onClick={onClose}
            className="rounded-full p-1 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-600"
            aria-label="Close district selector"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Selected count chip */}
      {selectedDistricts.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wide text-indigo-500 uppercase">
            {selectedDistricts.length} selected:
          </span>
          {selectedDistricts.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 py-0.5 pr-1.5 pl-2.5 text-[11px] font-medium text-white"
            >
              {d}
              <button
                id={`remove-district-${d.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => onToggle(d)}
                className="rounded-full p-0.5 transition hover:bg-indigo-500"
                aria-label={`Remove ${d}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* District Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {districts.map((district) => {
          const isSelected = selectedDistricts.includes(district);
          return (
            <button
              key={district}
              id={`district-${district.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onToggle(district)}
              className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'border-indigo-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
              aria-pressed={isSelected}
            >
              {/* Checkbox indicator */}
              <span
                className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-indigo-400'}`}
              >
                {isSelected ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="truncate">{district}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
