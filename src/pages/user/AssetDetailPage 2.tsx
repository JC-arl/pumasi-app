import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, MapPin, Phone } from 'lucide-react';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { mockRentalOffices } from '../../data/mockData';
import { createReservation, getAvailableCount } from '../../utils/reservationUtils';
import { createReservationNotification } from '../../utils/notificationUtils';
import type { Machinery, MachinerySpecification } from '../../types/rental';

export default function AssetDetailPage() {
  const { machineryId, id } = useParams<{ machineryId?: string; id?: string }>();
  const navigate = useNavigate();

  // machineryId가 있으면 사용하고, 없으면 id를 사용 (기존 호환성)
  const targetId = machineryId || id;

  const machinery = kimcheonMachinery.find((m: Machinery) => m.id === targetId);
  const office = machinery ? mockRentalOffices.find(o => o.id === machinery.officeId) : null;

  if (!machinery) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">농기계를 찾을 수 없습니다</h2>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  const handleReservation = (specification: MachinerySpecification) => {
    const availableCount = getAvailableCount(specification);
    
    if (availableCount === 0) {
      alert('현재 예약 가능한 농기계가 없습니다.');
      return;
    }
    
    // 새로운 예약 시스템으로 리다이렉트
    const params = new URLSearchParams({
      machinery: machinery.id,
      machineryName: machinery.name,
      office: office?.id || '',
      officeName: office?.name || '알 수 없음',
      specification: specification.specification,
      specificationId: specification.id,
      manufacturer: specification.manufacturer,
      rentalPrice: specification.rentalPrice.toString()
    });
    
    navigate(`/reserve?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        뒤로가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 농기계 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{machinery.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{machinery.category}</p>
            
            {office && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold text-gray-900">임대 사업소</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {office.name} - {office.address}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {office.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 규격별 예약 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">규격별 예약 현황</h2>
          
          <div className="space-y-4">
            {machinery.specifications.map((spec: MachinerySpecification) => (
              <div
                key={spec.id}
                className="border rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {spec.specification}
                    </h3>
                    <p className="text-sm text-gray-600">{spec.manufacturer}</p>
                    <p className="text-sm text-gray-500">{spec.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {getAvailableCount(spec)}/{spec.totalCount}
                    </div>
                    <div className="text-sm text-gray-500">대</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>가용률</span>
                    <span>
                      {spec.totalCount > 0 
                        ? Math.round((getAvailableCount(spec) / spec.totalCount) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${spec.totalCount > 0 
                          ? (getAvailableCount(spec) / spec.totalCount) * 100 
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      ₩{spec.rentalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/일</span>
                  </div>
                  
                  <button
                    onClick={() => handleReservation(spec)}
                    disabled={getAvailableCount(spec) === 0}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      getAvailableCount(spec) > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {getAvailableCount(spec) > 0 ? '예약하기' : '예약 불가'}
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  표준코드: {spec.standardCode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 추가 정보 */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          이용 안내
        </h3>
        <div className="prose prose-sm text-gray-600">
          <ul>
            <li>농기계 임대는 최소 1일 단위로 가능합니다.</li>
            <li>예약 후 취소는 이용 1일 전까지 가능합니다.</li>
            <li>농기계 운전에 필요한 면허증을 반드시 지참해 주세요.</li>
            <li>연료비는 별도로 청구됩니다.</li>
            <li>고장이나 문제 발생 시 즉시 임대 사업소에 연락해 주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}