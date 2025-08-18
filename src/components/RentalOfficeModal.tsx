import type { RentalOffice } from "../types/rental";

interface RentalOfficeModalProps {
  office: RentalOffice | null;
  isOpen: boolean;
  onClose: () => void;
}

const RentalOfficeModal = ({
  office,
  isOpen,
  onClose,
}: RentalOfficeModalProps) => {
  if (!isOpen || !office) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">{office.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">주소</h3>
              <p className="text-gray-600">{office.address}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">전화번호</h3>
              <p className="text-gray-600">{office.phone}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">운영시간</h3>
              <p className="text-gray-600">{office.operatingHours}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">설명</h3>
              <p className="text-gray-600">{office.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">보유 농기계</h3>
              <div className="flex flex-wrap gap-2">
                {office.availableMachinery.map((machinery, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {machinery}
                  </span>
                ))}
              </div>
            </div>

            {office.rating !== null && office.rating !== undefined && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">평점</h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(office.rating!)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {office.rating} ({office.reviewCount || 0}개 리뷰)
                  </span>
                </div>
              </div>
            )}

            {office.website && office.website !== null && (
              <div>
                <a
                  href={office.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  웹사이트 방문
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalOfficeModal;
