import React, { useState } from 'react';
import { X, Calendar, User, Phone, MapPin } from 'lucide-react';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import type { ReservationRequest } from '../../types/reservation';

interface ManualReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservation: ReservationRequest) => void;
}

interface ManualReservationForm {
  machineryId: string;
  machineryName: string;
  specification: string;
  officeId: string;
  officeName: string;
  startDate: string;
  endDate: string;
  farmerName: string;
  farmerPhone: string;
  farmAddress: string;
  farmSize: number;
  cropType: string;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  notes?: string;
}

const cropTypes = [
  '벼', '밀', '보리', '옥수수', '콩', '감자', '고구마', 
  '배추', '무', '양파', '마늘', '고추', '토마토', '오이',
  '사과', '배', '포도', '복숭아', '기타'
];

export default function ManualReservationModal({ isOpen, onClose, onSubmit }: ManualReservationModalProps) {
  const [formData, setFormData] = useState<ManualReservationForm>({
    machineryId: '',
    machineryName: '',
    specification: '',
    officeId: '',
    officeName: '',
    startDate: '',
    endDate: '',
    farmerName: '',
    farmerPhone: '',
    farmAddress: '',
    farmSize: 0,
    cropType: '',
    deliveryRequired: false,
    deliveryAddress: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<ManualReservationForm>>({});

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const availableMachinery = kimcheonMachinery.flatMap(machinery =>
    machinery.specifications.map(spec => ({
      id: `${machinery.id}-${spec.id}`,
      machineryId: machinery.id,
      name: machinery.name,
      specification: spec.specification,
      manufacturer: spec.manufacturer,
      officeId: machinery.officeId,
      officeName: '김천시 농기계 임대사업소', // 임시
    }))
  );

  const handleInputChange = (field: keyof ManualReservationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMachinerySelect = (machineryInfo: string) => {
    const [machineryId, specId] = machineryInfo.split('|');
    const machinery = kimcheonMachinery.find(m => m.id === machineryId);
    const spec = machinery?.specifications.find(s => s.id === specId);
    
    if (machinery && spec) {
      setFormData(prev => ({
        ...prev,
        machineryId: machinery.id,
        machineryName: machinery.name,
        specification: spec.specification,
        officeId: machinery.officeId,
        officeName: '김천시 농기계 임대사업소',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ManualReservationForm> = {};

    if (!formData.machineryId) newErrors.machineryId = '농기계를 선택해주세요';
    if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요';
    if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요';
    if (!formData.farmerName) newErrors.farmerName = '신청자명을 입력해주세요';
    if (!formData.farmerPhone) newErrors.farmerPhone = '연락처를 입력해주세요';
    if (!formData.farmAddress) newErrors.farmAddress = '농장 주소를 입력해주세요';
    if (!formData.farmSize || formData.farmSize <= 0) newErrors.farmSize = '농장 면적을 입력해주세요';
    if (!formData.cropType) newErrors.cropType = '작물 종류를 선택해주세요';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다';
    }

    if (formData.deliveryRequired && !formData.deliveryAddress) {
      newErrors.deliveryAddress = '배송 주소를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newReservation: ReservationRequest = {
      id: `M${Date.now().toString().slice(-6)}`, // Manual reservation prefix
      form: {
        selectedMachinery: [{
          machineryId: formData.machineryId,
          machineryName: formData.machineryName,
          specification: formData.specification,
          manufacturer: '',
          rentalPrice: 0,
          officeId: formData.officeId,
          officeName: formData.officeName,
        }],
        startDate: formData.startDate,
        endDate: formData.endDate,
        farmerName: formData.farmerName,
        farmerPhone: formData.farmerPhone,
        farmAddress: formData.farmAddress,
        farmSize: formData.farmSize,
        cropType: formData.cropType,
        deliveryRequired: formData.deliveryRequired,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
      },
      status: 'APPROVED', // Manual reservations are automatically approved
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: '관리자 (수동)',
    };

    onSubmit(newReservation);
    
    // Reset form
    setFormData({
      machineryId: '',
      machineryName: '',
      specification: '',
      officeId: '',
      officeName: '',
      startDate: '',
      endDate: '',
      farmerName: '',
      farmerPhone: '',
      farmAddress: '',
      farmSize: 0,
      cropType: '',
      deliveryRequired: false,
      deliveryAddress: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">수동 예약 등록</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 농기계 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">농기계 정보</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                농기계 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.machineryId ? `${formData.machineryId}|${formData.specification}` : ''}
                onChange={(e) => handleMachinerySelect(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.machineryId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">농기계를 선택하세요</option>
                {availableMachinery.map((item, index) => (
                  <option key={`${item.machineryId}-${index}`} value={`${item.machineryId}|${item.specification}`}>
                    {item.name} - {item.specification} ({item.manufacturer})
                  </option>
                ))}
              </select>
              {errors.machineryId && <p className="text-red-500 text-xs mt-1">{errors.machineryId}</p>}
            </div>
          </div>

          {/* 임대 일정 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">임대 일정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={formData.startDate || today}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* 신청자 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">신청자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.farmerName}
                  onChange={(e) => handleInputChange('farmerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.farmerName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="김농부"
                />
                {errors.farmerName && <p className="text-red-500 text-xs mt-1">{errors.farmerName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.farmerPhone}
                  onChange={(e) => handleInputChange('farmerPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.farmerPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="010-1234-5678"
                />
                {errors.farmerPhone && <p className="text-red-500 text-xs mt-1">{errors.farmerPhone}</p>}
              </div>
            </div>
          </div>

          {/* 농장 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">농장 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  농장 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.farmAddress}
                  onChange={(e) => handleInputChange('farmAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.farmAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="경상북도 김천시..."
                />
                {errors.farmAddress && <p className="text-red-500 text-xs mt-1">{errors.farmAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    농장 면적 (평) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.farmSize || ''}
                    onChange={(e) => handleInputChange('farmSize', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.farmSize ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1000"
                  />
                  {errors.farmSize && <p className="text-red-500 text-xs mt-1">{errors.farmSize}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작물 종류 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cropType}
                    onChange={(e) => handleInputChange('cropType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cropType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">작물을 선택하세요</option>
                    {cropTypes.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  {errors.cropType && <p className="text-red-500 text-xs mt-1">{errors.cropType}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 배송 옵션 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">배송 옵션</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deliveryRequired}
                    onChange={(e) => handleInputChange('deliveryRequired', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">배송 요청</span>
                </label>
              </div>
              {formData.deliveryRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    배송 주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.deliveryAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="농장 주소와 다른 경우 입력"
                  />
                  {errors.deliveryAddress && <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress}</p>}
                </div>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="추가 요청사항이나 메모를 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              수동 예약 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}