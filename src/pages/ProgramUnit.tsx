import React, { useState, useMemo } from 'react';
import { Plus, Package, Search } from 'lucide-react';
import {
  STATES,
  getDistricts,
  PROGRAM_UNITS,
  ProgramUnitItem,
} from '../features/programUnit/data/programUnitData';
import { SearchBar } from '../features/programUnit/components/SearchBar';
import { StateCard } from '../features/programUnit/components/StateCard';
import { ProgramUnitCard } from '../features/programUnit/components/ProgramUnitCard';
import { ProgramUnitDetailDrawer } from '../features/programUnit/components/ProgramUnitDetailDrawer';
import {
  AddProgramUnitModal,
  AddProgramUnitFormData,
} from '../features/programUnit/components/AddProgramUnitModal';
import { MultiSelectDropdown, MultiSelectOption } from '../components/ui/MultiSelectDropdown';
import { MapPin } from 'lucide-react';

const getUnitCountByState = (state: string): number =>
  PROGRAM_UNITS.filter((u) => u.state === state).length;

const EmptyUnits = ({ districts }: { districts: string[] }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
      <Package className="h-6 w-6 text-gray-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-700">No NSS units found</p>
      <p className="mt-0.5 text-[13px] text-gray-400">
        No program units registered in <span className="font-medium">{districts.join(', ')}</span>{' '}
        yet.
      </p>
    </div>
  </div>
);

const EmptySearch = () => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-12 text-center">
    <Search className="h-8 w-8 text-gray-300" />
    <p className="text-sm text-gray-400">No states match your search.</p>
  </div>
);

export const ProgramUnit = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ProgramUnitItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sortedStates = useMemo(() => [...STATES].sort(), []);

  const filteredStates = useMemo(
    () => sortedStates.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
    [sortedStates, searchQuery],
  );

  const districtOptions: MultiSelectOption[] = useMemo(
    () => (selectedState ? getDistricts(selectedState).map((d) => ({ value: d, label: d })) : []),
    [selectedState],
  );

  const units = useMemo(() => {
    if (!selectedState || selectedDistricts.length === 0) return [];
    return PROGRAM_UNITS.filter(
      (u) => u.state === selectedState && selectedDistricts.includes(u.district),
    );
  }, [selectedState, selectedDistricts]);

  const handleStateClick = (state: string) => {
    if (selectedState === state) {
      setSelectedState(null);
      setSelectedDistricts([]);
    } else {
      setSelectedState(state);
      setSelectedDistricts([]);
    }
  };

  const handleAddSubmit = (data: AddProgramUnitFormData) => {
    console.log('New program unit:', data);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-white px-6 py-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">NSS Program Units</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Browse and manage all NSS program units across India
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            id="program-unit-search"
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              setSelectedState(null);
              setSelectedDistricts([]);
            }}
            placeholder="Search states…"
          />
          <button
            id="add-program-unit-btn"
            onClick={() => setShowAddModal(true)}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Program Unit</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* State List */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              States &amp; UTs
            </p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
              {filteredStates.length}
            </span>
          </div>
          {selectedState && (
            <p className="text-[12px] font-medium text-indigo-500">
              {selectedState}
              {selectedDistricts.length > 0 && (
                <span className="ml-1 text-indigo-400">
                  · {selectedDistricts.length} district{selectedDistricts.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          )}
        </div>

        {filteredStates.length === 0 ? (
          <EmptySearch />
        ) : (
          <div className="flex flex-col gap-2">
            {filteredStates.map((state) => (
              <div key={state}>
                <StateCard
                  stateName={state}
                  unitCount={getUnitCountByState(state)}
                  isActive={selectedState === state}
                  onClick={() => handleStateClick(state)}
                />

                {/* Expanded panel below active state */}
                {selectedState === state && (
                  <div className="mt-2 mb-1 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    {/* District multi-select dropdown */}
                    <div className="mb-4 flex items-center gap-3">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                      <p className="text-[13px] font-semibold text-indigo-800">
                        Select districts in <span className="text-indigo-600">{state}</span>
                      </p>
                    </div>

                    <MultiSelectDropdown
                      id="district-multiselect"
                      options={districtOptions}
                      selected={selectedDistricts}
                      onChange={setSelectedDistricts}
                      placeholder="Select one or more districts…"
                      searchPlaceholder="Search districts…"
                      maxTagsShown={3}
                    />

                    {/* Units list */}
                    {selectedDistricts.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-3 flex items-center gap-2">
                          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                            Program Units
                            {selectedDistricts.length === 1
                              ? ` — ${selectedDistricts[0]}`
                              : ` — ${selectedDistricts.length} districts`}
                          </p>
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                            {units.length}
                          </span>
                        </div>
                        {units.length === 0 ? (
                          <EmptyUnits districts={selectedDistricts} />
                        ) : (
                          <div className="flex flex-col gap-2">
                            {units.map((unit) => (
                              <ProgramUnitCard
                                key={unit.id}
                                unit={unit}
                                onClick={() => setSelectedUnit(unit)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddProgramUnitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />
      <ProgramUnitDetailDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
};
