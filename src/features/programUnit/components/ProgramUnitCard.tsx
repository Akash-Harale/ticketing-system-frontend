import React from 'react';
import { Building2, ChevronRight, Users } from 'lucide-react';
import { ProgramUnitItem } from '../data/programUnitData';

interface ProgramUnitCardProps {
  unit: ProgramUnitItem;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-red-100 text-red-600',
};

const typeColors: Record<string, string> = {
  College: 'bg-blue-100 text-blue-600',
  University: 'bg-purple-100 text-purple-600',
  Institution: 'bg-orange-100 text-orange-600',
};

export const ProgramUnitCard = ({ unit, onClick }: ProgramUnitCardProps) => {
  return (
    <button
      id={`unit-card-${unit.id}`}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
        <Building2 className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{unit.name}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-gray-400">{unit.code}</span>
          <span className="text-gray-200">·</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[unit.type] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {unit.type}
          </span>
          <span className="text-gray-200">·</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[unit.status] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {unit.status}
          </span>
        </div>
        <p className="mt-1 truncate text-[12px] text-gray-500">{unit.coordinator.name}</p>
      </div>

      {/* Strength */}
      <div className="hidden flex-shrink-0 items-center gap-1.5 text-[12px] text-gray-400 sm:flex">
        <Users className="h-3.5 w-3.5" />
        <span>{unit.strength}</span>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-400" />
    </button>
  );
};
