import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Truck, FileText, CheckCircle, ChevronRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import type { ReservationForm, ReservationStep, MachinerySelection } from '../../types/reservation';
import { mockRentalOffices } from '../../data/mockData';
import { colors } from '../../styles/colors';

const steps: ReservationStep[] = [
  { id: 1, title: '농기계 선택', description: '임대할 농기계를 선택하세요', completed: false, active: true },
  { id: 2, title: '일정 선택', description: '임대 일정을 선택하세요', completed: false, active: false },
  { id: 3, title: '배송 옵션', description: '배송 방법을 선택하세요', completed: false, active: false },
  { id: 4, title: '신청 정보', description: '신청자 정보를 입력하세요', completed: false, active: false },
  { id: 5, title: '신청 완료', description: '예약 신청을 완료하세요', completed: false, active: false },
];

export default function ReservePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservationForm>>({
    selectedMachinery: searchParams.get('machinery') ? [{
      machineryId: searchParams.get('machinery') || '',
      machineryName: searchParams.get('machineryName') || '',
      specification: searchParams.get('specification') || '',
      manufacturer: searchParams.get('manufacturer') || '',
      rentalPrice: parseInt(searchParams.get('rentalPrice') || '0'),
      officeId: searchParams.get('office') || '',
      officeName: searchParams.get('officeName') || '',
    }] : [],
    deliveryRequired: false,
  });

  const updateSteps = (stepNum: number) => {
    return steps.map(step => ({
      ...step,
      completed: step.id < stepNum,
      active: step.id === stepNum,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Simple reservation ID: R + timestamp suffix (last 6 digits)
    const timestamp = Date.now().toString();
    const shortId = timestamp.slice(-6);
    
    const newReservation = {
      id: `R${shortId}`,
      form: formData as ReservationForm,
      status: 'PENDING' as const,
      submittedAt: new Date().toISOString(),
    };

    const existingReservations = JSON.parse(
      localStorage.getItem('reservationRequests') || '[]'
    );
    localStorage.setItem(
      'reservationRequests',
      JSON.stringify([...existingReservations, newReservation])
    );

    navigate('/my/reservations');
  };

  const currentSteps = updateSteps(currentStep);
  const selectedOffice = mockRentalOffices.find(office => office.id === formData.officeId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">농기계 예약 신청</h1>
        <p className="text-gray-600">단계별로 정보를 입력하여 농기계 임대를 신청하세요</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {currentSteps.map((step, stepIdx) => (
              <li 
                key={step.id} 
                className={`relative flex flex-col ${
                  stepIdx === 0 ? 'items-start' : 
                  stepIdx === currentSteps.length - 1 ? 'items-end' : 
                  'items-center'
                }`}
                style={{
                  flex: stepIdx === 0 || stepIdx === currentSteps.length - 1 ? '0 0 auto' : '1'
                }}
              >
                {stepIdx !== currentSteps.length - 1 && (
                  <div 
                    className="absolute top-4 h-0.5" 
                    aria-hidden="true"
                    style={{
                      left: stepIdx === 0 ? '32px' : '50%',
                      right: stepIdx === currentSteps.length - 2 ? '32px' : '50%',
                      transform: stepIdx === 0 ? 'none' : 
                                stepIdx === currentSteps.length - 2 ? 'none' : 
                                'translateX(-50%)',
                      width: stepIdx === 0 || stepIdx === currentSteps.length - 2 ? 
                             'calc(50% + 20px)' : '100%'
                    }}
                  >
                    <div 
                      className={`h-full transition-colors`} 
                      style={{
                        backgroundColor: step.completed ? colors.primary.main : '#e5e7eb',
                      }}
                    />
                  </div>
                )}
                <div className="relative flex h-8 w-8 items-center justify-center z-10">
                  {step.completed ? (
                    <CheckCircle 
                      className="h-8 w-8" 
                      style={{color: colors.primary.main}}
                    />
                  ) : step.active ? (
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{backgroundColor: colors.primary.main}}
                    >
                      <span className="text-white text-sm font-medium">{step.id}</span>
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">{step.id}</span>
                    </div>
                  )}
                </div>
                <div 
                  className={`mt-2 ${
                    stepIdx === 0 ? 'text-left' : 
                    stepIdx === currentSteps.length - 1 ? 'text-right' : 
                    'text-center'
                  }`}
                >
                  <span 
                    className={`text-sm font-medium whitespace-nowrap ${
                      step.active ? '' : step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}
                    style={step.active ? {color: colors.primary.main} : {}}
                  >
                    {step.title}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 1 && (
          <MachinerySelection formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 2 && (
          <DateSelection formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 3 && (
          <DeliveryOptions formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 4 && (
          <FarmerInfo formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 5 && (
          <ReservationSummary formData={formData} selectedOffice={selectedOffice} />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white rounded-md flex items-center"
              style={{
                backgroundColor: colors.primary.main,
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.button.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary.main}
            >
              다음
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium text-white rounded-md"
              style={{
                backgroundColor: colors.primary.main,
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.button.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary.main}
            >
              예약 신청 완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function MachinerySelection({ formData, setFormData }: {
  formData: Partial<ReservationForm>;
  setFormData: (data: Partial<ReservationForm>) => void;
}) {
  const selectedMachinery = formData.selectedMachinery || [];

  const removeMachinery = (machineryId: string) => {
    const updated = selectedMachinery.filter(m => m.machineryId !== machineryId);
    setFormData({ ...formData, selectedMachinery: updated });
  };

  const totalPrice = selectedMachinery.reduce((sum, machinery) => sum + machinery.rentalPrice, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">농기계 선택</h3>
        <div className="flex items-center text-sm text-gray-500">
          <ShoppingCart className="h-4 w-4 mr-1" />
          {selectedMachinery.length}개 선택됨
        </div>
      </div>

      {selectedMachinery.length > 0 ? (
        <div className="space-y-4">
          {selectedMachinery.map((machinery, index) => (
            <div 
              key={`${machinery.machineryId}-${index}`} 
              className="p-4 rounded-lg border"
              style={{backgroundColor: colors.primary.accent, borderColor: colors.border.light}}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {machinery.machineryName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {machinery.specification} - {machinery.manufacturer}
                  </p>
                  <p className="text-sm text-gray-600">
                    임대사업소: {machinery.officeName}
                  </p>
                  <p className="text-sm font-medium mt-2" style={{color: colors.primary.main}}>
                    ₩{machinery.rentalPrice.toLocaleString()}/일
                  </p>
                </div>
                <button
                  onClick={() => removeMachinery(machinery.machineryId)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="선택 취소"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">총 임대료 (1일 기준)</span>
              <span className="text-xl font-bold" style={{color: colors.primary.main}}>
                ₩{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 같은 날짜에 여러 농기계를 함께 예약할 수 있습니다. 
              추가로 농기계를 선택하려면 <a href="/map" className="underline font-medium">지도</a>에서 선택하세요.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">선택된 농기계가 없습니다</h4>
          <p className="text-sm text-gray-500 mb-4">
            농기계를 선택하려면 지도에서 농기계를 먼저 선택해주세요.
          </p>
          <a 
            href="/map" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md"
            style={{backgroundColor: colors.primary.main}}
          >
            <Plus className="h-4 w-4 mr-2" />
            농기계 선택하러 가기
          </a>
        </div>
      )}
    </div>
  );
}

function DateSelection({ formData, setFormData }: {
  formData: Partial<ReservationForm>;
  setFormData: (data: Partial<ReservationForm>) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const rentalPeriods = [
    { value: '반일', days: 0.5, label: '반일 (6시간)' },
    { value: '1일', days: 1, label: '1일 (24시간)' },
    { value: '2일', days: 2, label: '2일' },
    { value: '3일', days: 3, label: '3일' },
    { value: '1주일', days: 7, label: '1주일 (7일)' },
    { value: '2주일', days: 14, label: '2주일 (14일)' },
  ];

  const handleStartDateChange = (startDate: string) => {
    const newFormData = { ...formData, startDate };
    
    // 기간이 선택되어 있으면 자동으로 종료일 계산
    if (formData.rentalPeriod && startDate) {
      const period = rentalPeriods.find(p => p.value === formData.rentalPeriod);
      if (period) {
        const start = new Date(startDate);
        const end = new Date(start);
        
        if (period.days < 1) {
          // 반일인 경우 같은 날
          newFormData.endDate = startDate;
        } else {
          end.setDate(start.getDate() + period.days - 1);
          newFormData.endDate = end.toISOString().split('T')[0];
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleRentalPeriodChange = (periodValue: string) => {
    const period = rentalPeriods.find(p => p.value === periodValue);
    const newFormData = { ...formData, rentalPeriod: periodValue };
    
    if (period && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      
      if (period.days < 1) {
        // 반일인 경우 같은 날
        newFormData.endDate = formData.startDate;
      } else {
        end.setDate(start.getDate() + period.days - 1);
        newFormData.endDate = end.toISOString().split('T')[0];
      }
    }
    
    setFormData(newFormData);
  };

  const selectedMachinery = formData.selectedMachinery || [];
  const totalPrice = selectedMachinery.reduce((sum, machinery) => sum + machinery.rentalPrice, 0);
  const selectedPeriod = rentalPeriods.find(p => p.value === formData.rentalPeriod);
  const totalRentalCost = selectedPeriod ? totalPrice * selectedPeriod.days : totalPrice;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">임대 일정 선택</h3>
      <div className="space-y-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            임대 시작일 (년/월/일 선택)
          </label>
          <input
            type="date"
            id="startDate"
            min={today}
            value={formData.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: '#d1d5db',
              focusRingColor: colors.primary.main
            }}
            placeholder="임대 시작일을 선택하세요"
          />
          {formData.startDate && (
            <p className="text-sm text-gray-600 mt-1">
              선택된 날짜: {formatDateDisplay(formData.startDate)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">임대 기간</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rentalPeriods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => handleRentalPeriodChange(period.value)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  formData.rentalPeriod === period.value
                    ? 'text-white'
                    : 'text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
                style={formData.rentalPeriod === period.value ? {
                  backgroundColor: colors.primary.main,
                  borderColor: colors.primary.main
                } : {}}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {formData.endDate && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">시작일:</span>
                <div className="font-medium">{formatDateDisplay(formData.startDate || '')}</div>
              </div>
              <div>
                <span className="text-gray-500">종료일:</span>
                <div className="font-medium">{formatDateDisplay(formData.endDate)}</div>
              </div>
              <div>
                <span className="text-gray-500">총 임대료:</span>
                <div className="font-bold text-lg" style={{color: colors.primary.main}}>
                  ₩{totalRentalCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {!formData.startDate && (
          <p className="text-sm text-gray-500">
            먼저 임대 시작일을 선택해주세요.
          </p>
        )}
      </div>
    </div>
  );
}

function DeliveryOptions({ formData, setFormData }: {
  formData: Partial<ReservationForm>;
  setFormData: (data: Partial<ReservationForm>) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">배송 옵션</h3>
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="delivery"
              checked={!formData.deliveryRequired}
              onChange={() => setFormData({ ...formData, deliveryRequired: false, deliveryAddress: undefined })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">직접 수령</span>
              </div>
              <p className="text-sm text-gray-500 ml-7">임대사업소에서 직접 수령</p>
            </div>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="delivery"
              checked={formData.deliveryRequired}
              onChange={() => setFormData({ ...formData, deliveryRequired: true })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">배송 요청</span>
              </div>
              <p className="text-sm text-gray-500 ml-7">지정 장소로 배송 (추가 요금 발생 가능)</p>
            </div>
          </label>
        </div>

        {formData.deliveryRequired && (
          <div className="mt-4">
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
              배송 주소
            </label>
            <textarea
              id="deliveryAddress"
              rows={3}
              value={formData.deliveryAddress || ''}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="상세한 배송 주소를 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FarmerInfo({ formData, setFormData }: {
  formData: Partial<ReservationForm>;
  setFormData: (data: Partial<ReservationForm>) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">신청자 정보</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="farmerName" className="block text-sm font-medium text-gray-700 mb-2">
              성명 *
            </label>
            <input
              type="text"
              id="farmerName"
              value={formData.farmerName || ''}
              onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="farmerPhone" className="block text-sm font-medium text-gray-700 mb-2">
              연락처 *
            </label>
            <input
              type="tel"
              id="farmerPhone"
              value={formData.farmerPhone || ''}
              onChange={(e) => setFormData({ ...formData, farmerPhone: e.target.value })}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="farmAddress" className="block text-sm font-medium text-gray-700 mb-2">
            농장 주소 *
          </label>
          <textarea
            id="farmAddress"
            rows={2}
            value={formData.farmAddress || ''}
            onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
            placeholder="농장 주소를 입력해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-2">
              농장 규모 (평)
            </label>
            <input
              type="number"
              id="farmSize"
              value={formData.farmSize || ''}
              onChange={(e) => setFormData({ ...formData, farmSize: parseInt(e.target.value) })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-2">
              재배 작물
            </label>
            <input
              type="text"
              id="cropType"
              value={formData.cropType || ''}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              placeholder="예: 벼, 콩, 옥수수 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            특이사항
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="추가 요청사항이나 특이사항을 입력해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function ReservationSummary({ formData, selectedOffice }: {
  formData: Partial<ReservationForm>;
  selectedOffice?: any;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">예약 신청 확인</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">선택한 농기계</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">농기계:</span> {formData.machineryName}</p>
            <p><span className="font-medium">임대사업소:</span> {selectedOffice?.name}</p>
            <p><span className="font-medium">임대 기간:</span> {formData.startDate} ~ {formData.endDate}</p>
            <p><span className="font-medium">배송:</span> {formData.deliveryRequired ? '배송 요청' : '직접 수령'}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">신청자 정보</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">성명:</span> {formData.farmerName}</p>
            <p><span className="font-medium">연락처:</span> {formData.farmerPhone}</p>
            <p><span className="font-medium">농장 주소:</span> {formData.farmAddress}</p>
            {formData.farmSize && <p><span className="font-medium">농장 규모:</span> {formData.farmSize}평</p>}
            {formData.cropType && <p><span className="font-medium">재배 작물:</span> {formData.cropType}</p>}
          </div>
        </div>

        {formData.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">특이사항</h4>
            <p className="text-sm text-gray-700">{formData.notes}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">신청 안내</p>
              <p className="text-blue-700">
                예약 신청 후 관리자 승인이 완료되면 연락을 드립니다. 
                승인까지 1-2일 정도 소요될 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}