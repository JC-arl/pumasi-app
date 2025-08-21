import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EquipmentData {
  name: string;
  model: string;
  standardCode: string;
  manufacturer: string;
  purchaseDate: string;
  purchasePrice: number;
  officeId: string;
  specifications: string;
  description: string;
  categoryId: string;
}

interface EquipmentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EquipmentData) => void;
}

const equipmentCategories = [
  { id: 'tractor', name: '트랙터류' },
  { id: 'cultivator', name: '경운·정지 장비' },
  { id: 'harvester', name: '수확 장비' },
  { id: 'seeder', name: '파종·이앙 장비' },
  { id: 'sprayer', name: '방제·살포 장비' },
  { id: 'transport', name: '운반·적재 장비' },
  { id: 'excavator', name: '굴착·토목 장비' },
  { id: 'processing', name: '가공·파쇄 장비' },
  { id: 'other', name: '기타 장비' },
];

const officeOptions = [
  { id: 'OF-001', name: '춘천지점' },
  { id: 'OF-002', name: '원주지점' },
  { id: 'OF-003', name: '강릉지점' },
  { id: 'OF-004', name: '홍천지점' },
  { id: 'OF-005', name: '평창지점' },
];

export default function EquipmentRegistrationModal({ isOpen, onClose, onSubmit }: EquipmentRegistrationModalProps) {
  const [formData, setFormData] = useState<EquipmentData>({
    name: '',
    model: '',
    standardCode: '',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: 0,
    officeId: '',
    specifications: '',
    description: '',
    categoryId: '',
  });

  const [errors, setErrors] = useState<Partial<EquipmentData>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: keyof EquipmentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<EquipmentData> = {};
    
    if (!formData.name.trim()) newErrors.name = '장비명은 필수입니다';
    if (!formData.model.trim()) newErrors.model = '모델명은 필수입니다';
    if (!formData.standardCode.trim()) newErrors.standardCode = '표준코드는 필수입니다';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = '제조사는 필수입니다';
    if (!formData.purchaseDate) newErrors.purchaseDate = '구입일은 필수입니다';
    if (!formData.purchasePrice || formData.purchasePrice <= 0) newErrors.purchasePrice = '유효한 구입가격을 입력하세요';
    if (!formData.officeId) newErrors.officeId = '소속 사업소를 선택하세요';
    if (!formData.categoryId) newErrors.categoryId = '장비 카테고리를 선택하세요';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // 폼 초기화
      setFormData({
        name: '',
        model: '',
        standardCode: '',
        manufacturer: '',
        purchaseDate: '',
        purchasePrice: 0,
        officeId: '',
        specifications: '',
        description: '',
        categoryId: '',
      });
      setErrors({});
      onClose();
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setFormData({
      name: '',
      model: '',
      standardCode: '',
      manufacturer: '',
      purchaseDate: '',
      purchasePrice: 0,
      officeId: '',
      specifications: '',
      description: '',
      categoryId: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">장비 등록</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장비명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: 대형트랙터"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모델명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.model ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: John Deere 8345R"
                />
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  표준코드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.standardCode}
                  onChange={(e) => handleInputChange('standardCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.standardCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: STD-001"
                />
                {errors.standardCode && <p className="text-red-500 text-xs mt-1">{errors.standardCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제조사 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.manufacturer ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: John Deere"
                />
                {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장비 카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {equipmentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소속 사업소 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.officeId}
                  onChange={(e) => handleInputChange('officeId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.officeId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">사업소를 선택하세요</option>
                  {officeOptions.map(office => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
                {errors.officeId && <p className="text-red-500 text-xs mt-1">{errors.officeId}</p>}
              </div>
            </div>
          </div>

          {/* 구입 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">구입 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구입일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purchaseDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구입가격 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value, 10) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purchasePrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: 50000000"
                />
                {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">상세 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사양
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => handleInputChange('specifications', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 엔진: 342마력, 중량: 14,500kg, 연료: 디젤"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="장비에 대한 추가 설명이나 특징을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              장비 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}