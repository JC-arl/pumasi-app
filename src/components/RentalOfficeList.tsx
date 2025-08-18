import type { RentalOffice } from "../types/rental";

interface RentalOfficeListProps {
  offices: RentalOffice[];
  onOfficeSelect: (office: RentalOffice) => void;
  selectedOffice?: RentalOffice | null;
}

const RentalOfficeList = ({
  offices,
  onOfficeSelect,
  selectedOffice,
}: RentalOfficeListProps) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        총 {offices.length}개의 임대소가 있습니다.
      </div>

      {offices.map((office) => (
        <div
          key={office.id}
          onClick={() => onOfficeSelect(office)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedOffice?.id === office.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{office.name}</h3>
            {office.rating !== null && office.rating !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-yellow-400 mr-1">★</span>
                {office.rating}
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-2">{office.address}</p>
          <p className="text-gray-500 text-sm mb-2">{office.phone}</p>

          <div className="flex flex-wrap gap-1">
            {office.availableMachinery.slice(0, 3).map((machinery, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {machinery}
              </span>
            ))}
            {office.availableMachinery.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{office.availableMachinery.length - 3}개 더
              </span>
            )}
          </div>
        </div>
      ))}

      {offices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
};

export default RentalOfficeList;
