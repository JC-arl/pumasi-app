import { useState } from 'react';
import { ChevronDown, MapPin, Building2 } from 'lucide-react';
import { regions, mockAdminUser } from '../../data/regionData';
// import type { Region } from '../../types/admin';

interface RegionSelectorProps {
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
}

export default function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const adminRegions = regions.filter(region => 
    mockAdminUser.assignedRegions.includes(region.id)
  );

  const selectedRegionName = selectedRegion 
    ? regions.find(r => r.id === selectedRegion)?.name 
    : '전체 지역';

  const handleRegionSelect = (regionId: string | null) => {
    onRegionChange(regionId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 min-w-[200px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="block truncate">{selectedRegionName}</span>
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div
            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-600 hover:text-white flex items-center"
            onClick={() => handleRegionSelect(null)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span className="block truncate">전체 지역</span>
            {selectedRegion === null && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              </span>
            )}
          </div>
          
          {adminRegions.map((region) => (
            <div
              key={region.id}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-600 hover:text-white flex items-center"
              onClick={() => handleRegionSelect(region.id)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="block truncate">{region.name}</span>
                <span className="text-xs text-gray-500 hover:text-blue-200">
                  {region.offices.length}개 사업소
                </span>
              </div>
              {selectedRegion === region.id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}