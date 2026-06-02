import React from 'react';
import { ChevronRight } from 'lucide-react';

interface StateCardProps {
  stateName: string;
  unitCount: number;
  onClick: () => void;
  isActive?: boolean;
}

export const StateCard = ({ stateName, unitCount, onClick, isActive = false }: StateCardProps) => {
  const initials = stateName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <button
      id={`state-card-${stateName.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
        isActive
          ? 'border-indigo-300 bg-indigo-50 shadow-md shadow-indigo-100'
          : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
        }`}
      >
        {initials}
      </div>

      {/* Name */}
      <span
        className={`flex-1 text-sm font-semibold transition-colors ${
          isActive ? 'text-indigo-700' : 'text-gray-800 group-hover:text-indigo-700'
        }`}
      >
        {stateName}
      </span>

      {/* Unit Count Badge */}
      {unitCount > 0 && (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
            isActive ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {unitCount} unit{unitCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Arrow */}
      <ChevronRight
        className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${
          isActive
            ? 'translate-x-0.5 text-indigo-500'
            : 'text-gray-300 group-hover:translate-x-0.5 group-hover:text-indigo-400'
        }`}
      />
    </button>
  );
};
